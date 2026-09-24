require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function normalizePhone(phone) {
  let value = String(phone || '').replace(/\s+/g, '');

  if (value.startsWith('+254')) {
    value = value.substring(1);
  }

  if (value.startsWith('07') || value.startsWith('01')) {
    value = '254' + value.substring(1);
  }

  return value;
}

async function getDarajaToken() {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const baseUrl =
    process.env.DARAJA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const response = await axios.get(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return {
    token: response.data.access_token,
    baseUrl,
  };
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Teachers Online API is running.',
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      password,
      teacherLevel,
      county,
      subCounty,
      school,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !password ||
      !teacherLevel ||
      !county ||
      !subCounty ||
      !school
    ) {
      return res.status(400).json({
        success: false,
        message: 'All registration fields are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    const normalizedPhone = normalizePhone(phone);

    if (!/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Kenyan phone number.',
      });
    }

    const { data: existingTeacher, error: existingError } =
      await supabase
        .from('teachers')
        .select('id, payment_status')
        .eq('phone', normalizedPhone)
        .maybeSingle();

    if (existingError) {
      console.error('DATABASE CHECK ERROR:', existingError);

      return res.status(500).json({
        success: false,
        message: 'Could not check registration.',
      });
    }

    if (existingTeacher?.payment_status === 'paid') {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered.',
      });
    }

    const teacherId = existingTeacher?.id || crypto.randomUUID();

    const internalEmail =
      `${normalizedPhone}@teachers-online.local`;

    let authUserId = teacherId;

    if (!existingTeacher) {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: internalEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName.trim(),
            phone: normalizedPhone,
            teacher_level: teacherLevel,
            county: county.trim(),
            sub_county: subCounty.trim(),
            school: school.trim(),
          },
        });

      if (authError) {
        console.error('AUTH CREATION ERROR:', authError);

        return res.status(400).json({
          success: false,
          message: authError.message,
        });
      }

      authUserId = authData.user.id;
    } else {
      const { error: updateAuthError } =
        await supabase.auth.admin.updateUserById(
          existingTeacher.id,
          {
            password,
            user_metadata: {
              full_name: fullName.trim(),
              phone: normalizedPhone,
              teacher_level: teacherLevel,
              county: county.trim(),
              sub_county: subCounty.trim(),
              school: school.trim(),
            },
          }
        );

      if (updateAuthError) {
        console.error('AUTH UPDATE ERROR:', updateAuthError);
      }
    }

    const { error: teacherError } = await supabase
      .from('teachers')
      .upsert({
        id: authUserId,
        full_name: fullName.trim(),
        phone: normalizedPhone,
        teacher_level: teacherLevel,
        county: county.trim(),
        sub_county: subCounty.trim(),
        school: school.trim(),
        payment_status: 'pending',
        amount: 50,
        updated_at: new Date().toISOString(),
      });

    if (teacherError) {
      console.error('TEACHER DATABASE ERROR:', teacherError);

      return res.status(500).json({
        success: false,
        message: 'Could not save teacher registration.',
      });
    }

    const { token, baseUrl } = await getDarajaToken();

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    const now = new Date();

    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const passwordEncoded = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString('base64');

    const stkResponse = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: passwordEncoded,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: 50,
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_PARTY_B,
        PhoneNumber: normalizedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: authUserId,
        TransactionDesc: 'Teachers Online Registration',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (stkResponse.data.ResponseCode !== '0') {
      console.error('STK PUSH ERROR:', stkResponse.data);

      return res.status(400).json({
        success: false,
        message:
          stkResponse.data.ResponseDescription ||
          'M-Pesa payment request could not be started.',
      });
    }

    const checkoutRequestId =
      stkResponse.data.CheckoutRequestID;

    await supabase
      .from('teachers')
      .update({
        checkout_request_id: checkoutRequestId,
        payment_status: 'pending',
        amount: 50,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUserId);

    return res.json({
      success: true,
      message:
        'M-Pesa payment request sent. Please enter your M-Pesa PIN.',
      checkoutRequestId,
    });
  } catch (error) {
    console.error(
      'REGISTRATION ERROR:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to start registration payment.',
    });
  }
});

app.post('/api/mpesa/callback', async (req, res) => {
  try {
    console.log(
      'MPESA CALLBACK:',
      JSON.stringify(req.body, null, 2)
    );

    const stk = req.body?.Body?.stkCallback;

    if (!stk) {
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }

    const checkoutRequestId = stk.CheckoutRequestID;
    const resultCode = Number(stk.ResultCode);
    const resultDesc = stk.ResultDesc;

    let receipt = null;

    if (Array.isArray(stk.CallbackMetadata?.Item)) {
      const receiptItem = stk.CallbackMetadata.Item.find(
        item => item.Name === 'MpesaReceiptNumber'
      );

      receipt = receiptItem?.Value || null;
    }

    const paymentStatus =
      resultCode === 0 ? 'paid' : 'failed';

    const { error } = await supabase
      .from('teachers')
      .update({
        payment_status: paymentStatus,
        mpesa_receipt: receipt,
        result_code: resultCode,
        result_desc: resultDesc,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', checkoutRequestId);

    if (error) {
      console.error('CALLBACK DATABASE ERROR:', error);
    }

    console.log(
      `Payment ${paymentStatus}: ${checkoutRequestId}`
    );

    return res.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  } catch (error) {
    console.error('CALLBACK ERROR:', error);

    return res.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(
    'Teachers Online API running on port ' + PORT
  );
});