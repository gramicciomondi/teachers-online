import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COUNTY_DATA: Record<string, string[]> = {
  Baringo: ['Baringo Central', 'Baringo North', 'East Pokot', 'Mogotio', 'Marigat', 'Tiaty'],
  Bomet: ['Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'],
  Bungoma: ['Bumula', 'Kabuchai', 'Kanduyi', 'Kimilili', 'Mt Elgon', 'Sirisia', 'Tongaren', 'Webuye East', 'Webuye West'],
  Busia: ['Budalangi', 'Butula', 'Matayos', 'Nambale', 'Samia', 'Teso North', 'Teso South', 'Teso Central'],
  Embu: ['Manyatta', 'Mbeere North', 'Mbeere South', 'Runyenjes'],
  Garissa: ['Dadaab', 'Fafi', 'Garissa Township', 'Hulugho', 'Ijara', 'Lagdera', 'Balambala'],
  HomaBay: ['Homa Bay Town', 'Kabondo Kasipul', 'Karachuonyo', 'Karungu', 'Mbita', 'Ndhiwa', 'Rangwe', 'Suba North'],
  Isiolo: ['Isiolo Central', 'Isiolo South', 'Merti'],
  Kakamega: ['Butere', 'Khwisero', 'Lugari', 'Lurambi', 'Malava', 'Matungu', 'Mumias East', 'Mumias West', 'Navakholo', 'Shinyalu'],
  Kericho: ['Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Sigowet/Soin'],
  Kiambu: ['Gatundu North', 'Gatundu South', 'Githunguri', 'Juja', 'Kabete', 'Kiambaa', 'Kiambu', 'Kikuyu', 'Limuru', 'Ruiru', 'Thika Town', 'Lari'],
  Kilifi: ['Chonyi', 'Ganze', 'Kaloleni', 'Kilifi North', 'Kilifi South', 'Magarini', 'Malindi', 'Rabai'],
  Kirinyaga: ['Kirinyaga Central', 'Kirinyaga East', 'Kirinyaga West', 'Mwea East', 'Mwea West'],
  Kisii: ['Bobasi', 'Bomachoge Borabu', 'Bomachoge Chache', 'Bonchari', 'Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Chache', 'Nyaribari Masaba', 'South Mugirango'],
  Kisumu: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyakach', 'Nyando', 'Seme'],
  Kitui: ['Ikutha', 'Katulani', 'Kisasi', 'Kitui Central', 'Kitui East', 'Kitui Rural', 'Kitui South', 'Kitui West', 'Kyuso', 'Mwingi Central', 'Mwingi North', 'Mwingi West'],
  Kwale: ['Kinango', 'Lunga Lunga', 'Matuga', 'Msambweni'],
  Laikipia: ['Laikipia Central', 'Laikipia East', 'Laikipia North'],
  Lamu: ['Lamu East', 'Lamu West'],
  Machakos: ['Kangundo', 'Kathiani', 'Machakos Town', 'Masinga', 'Matungulu', 'Mavoko', 'Yatta'],
  Makueni: ['Kaiti', 'Kibwezi East', 'Kibwezi West', 'Kilome', 'Makueni', 'Mbooni'],
  Mandera: ['Banissa', 'Lafey', 'Mandera Central', 'Mandera East', 'Mandera North', 'Mandera South', 'Mandera West'],
  Marsabit: ['Laisamis', 'Moyale', 'North Horr', 'Saku'],
  Meru: ['Buuri', 'Igembe Central', 'Igembe North', 'Igembe South', 'Imenti North', 'Imenti South', 'Tigania East', 'Tigania West'],
  Migori: ['Awendo', 'Kuria East', 'Kuria West', 'Nyatike', 'Rongo', 'Suna East', 'Suna West', 'Uriri'],
  Mombasa: ['Changamwe', 'Jomvu', 'Kisauni', 'Likoni', 'Mvita', 'Nyali'],
  "Murang'a": ['Gatanga', 'Kahuro', 'Kandara', 'Kangema', 'Kigumo', 'Kiharu', 'Mathioya', 'Murang’a South'],
  Nairobi: ['Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East', 'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani', 'Kibra', 'Lang’ata', 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands'],
  Nakuru: ['Bahati', 'Gilgil', 'Kuresoi North', 'Kuresoi South', 'Molo', 'Naivasha', 'Nakuru Town East', 'Nakuru Town West', 'Njoro', 'Rongai', 'Subukia'],
  Nandi: ['Aldai', 'Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Tindiret'],
  Narok: ['Narok East', 'Narok North', 'Narok South', 'Narok West', 'Transmara East', 'Transmara West'],
  Nyamira: ['Borabu', 'Manga', 'Masaba North', 'Nyamira North', 'Nyamira South'],
  Nyandarua: ['Kinangop', 'Kipipiri', 'Ndaragwa', 'Ol Jorok', 'Ol Kalou'],
  Nyeri: ['Kieni East', 'Kieni West', 'Mathira East', 'Mathira West', 'Mukurweini', 'Nyeri Town', 'Othaya', 'Tetu'],
  Samburu: ['Samburu East', 'Samburu North', 'Samburu West'],
  Siaya: ['Alego Usonga', 'Bondo', 'Gem', 'Rarieda', 'Ugenya', 'Ugunja'],
  TaitaTaveta: ['Mwatate', 'Taita', 'Taveta', 'Voi'],
  TanaRiver: ['Bura', 'Galole', 'Garsen'],
  TharakaNithi: ['Chuka/Igambang’ombe', 'Maara', 'Tharaka'],
  TransNzoia: ['Cherangany', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'],
  Turkana: ['Loima', 'Turkana Central', 'Turkana East', 'Turkana North', 'Turkana South', 'Turkana West'],
  UasinGishu: ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'],
  Vihiga: ['Emuhaya', 'Hamisi', 'Luanda', 'Sabatia', 'Vihiga'],
  Wajir: ['Eldas', 'Tarbaj', 'Wajir East', 'Wajir North', 'Wajir South', 'Wajir West'],
  WestPokot: ['Kacheliba', 'Pokot South', 'Pokot Central', 'West Pokot'],
};

const COUNTY_NAMES: Record<string, string> = {
  HomaBay: 'Homa Bay',
  TaitaTaveta: 'Taita-Taveta',
  TanaRiver: 'Tana River',
  TharakaNithi: 'Tharaka-Nithi',
  TransNzoia: 'Trans Nzoia',
  UasinGishu: 'Uasin Gishu',
  WestPokot: 'West Pokot',
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [teacherLevel, setTeacherLevel] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [school, setSchool] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState<'county' | 'subCounty' | null>(null);

  const counties = useMemo(
    () =>
      Object.keys(COUNTY_DATA).sort((a, b) =>
        (COUNTY_NAMES[a] || a).localeCompare(COUNTY_NAMES[b] || b)
      ),
    []
  );

  const subCounties = county ? COUNTY_DATA[county] || [] : [];

  const checkPaymentStatus = async (checkoutRequestId: string) => {
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await fetch(
          `https://teachers-online.onrender.com/api/payment-status/${encodeURIComponent(
            checkoutRequestId
          )}`
        );

        const data = await response.json();

        if (data.success && data.paymentStatus === 'paid') {
          return {
            paid: true,
            receipt: data.mpesaReceipt,
          };
        }

        if (data.success && data.paymentStatus === 'failed') {
          return {
            paid: false,
            failed: true,
          };
        }
      } catch (error) {
        console.log('PAYMENT STATUS CHECK ERROR:', error);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return {
      paid: false,
      timeout: true,
    };
  };

  const registerTeacher = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !password ||
      !teacherLevel ||
      !county ||
      !subCounty ||
      !school.trim()
    ) {
      Alert.alert('Missing information', 'Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Password too short',
        'Your password must contain at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://teachers-online.onrender.com/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
            password,
            teacherLevel,
            county: COUNTY_NAMES[county] || county,
            subCounty,
            school: school.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Registration failed',
          data.message || 'Could not start registration.'
        );
        return;
      }

      if (data.paymentRequired === false) {
        Alert.alert(
          'Registration Successful',
          'Congratulations! You are one of the first 1,000 founding teachers. Your Teachers Online account is active and no registration fee was required.'
        );
        return;
      }

      if (!data.checkoutRequestId) {
        Alert.alert(
          'Payment Error',
          'M-Pesa payment request was not created.'
        );
        return;
      }

      Alert.alert(
        'M-Pesa Payment',
        'A KSh 50 payment prompt has been sent to your phone. Enter your M-Pesa PIN, then wait for confirmation.'
      );

      const paymentResult = await checkPaymentStatus(
        data.checkoutRequestId
      );

      if (paymentResult.paid) {
        Alert.alert(
          'Registration Successful',
          `Your KSh 50 payment has been confirmed${
            paymentResult.receipt
              ? `.\n\nM-Pesa Receipt: ${paymentResult.receipt}`
              : '.'
          }\n\nYour Teachers Online account is now active.`
        );
      } else if (paymentResult.failed) {
        Alert.alert(
          'Payment Failed',
          'The KSh 50 payment was not completed. Please try registration again.'
        );
      } else {
        Alert.alert(
          'Payment Pending',
          'We have not received confirmation yet. Please wait a little and try again if your payment was completed.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to Teachers Online. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openSubCounty = () => {
    if (!county) {
      Alert.alert('Select County', 'Please select your county first.');
      return;
    }

    setDropdown('subCounty');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="school-outline" size={38} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Join Teachers Online</Text>

          <Text style={styles.subtitle}>
            Create your teacher account and connect with your community.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create Account</Text>

            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="e.g. 0712345678"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={21}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Teacher Level</Text>

            <View style={styles.levelRow}>
              {['Primary', 'Junior Secondary', 'Senior Secondary'].map(
                level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      teacherLevel === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setTeacherLevel(level)}
                  >
                    <Ionicons
                      name={
                        teacherLevel === level
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={20}
                      color={
                        teacherLevel === level ? '#FFFFFF' : '#64748B'
                      }
                    />

                    <Text
                      style={[
                        styles.levelText,
                        teacherLevel === level && styles.levelTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.label}>County</Text>

            <TouchableOpacity
              style={styles.inputBox}
              onPress={() => setDropdown('county')}
            >
              <Ionicons name="location-outline" size={20} color="#64748B" />

              <Text
                style={[
                  styles.dropdownText,
                  !county && styles.placeholderText,
                ]}
              >
                {county ? COUNTY_NAMES[county] || county : 'Select county'}
              </Text>

              <Ionicons
                name="chevron-down-outline"
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            <Text style={styles.label}>Sub-County</Text>

            <TouchableOpacity
              style={styles.inputBox}
              onPress={openSubCounty}
            >
              <Ionicons name="navigate-outline" size={20} color="#64748B" />

              <Text
                style={[
                  styles.dropdownText,
                  !subCounty && styles.placeholderText,
                ]}
              >
                {subCounty || 'Select sub-county'}
              </Text>

              <Ionicons
                name="chevron-down-outline"
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            <Text style={styles.label}>School</Text>

            <View style={styles.inputBox}>
              <Ionicons name="business-outline" size={20} color="#64748B" />

              <TextInput
                style={styles.input}
                placeholder="Enter the school where you teach"
                placeholderTextColor="#94A3B8"
                value={school}
                onChangeText={setSchool}
              />
            </View>

            <View style={styles.paymentBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#059669"
              />

              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>
                  ?? First 1,000 Teachers Register Free
                </Text>

                <Text style={styles.paymentSubtitle}>
                  Join during our launch period with no registration fee. After the first 1,000 teachers, KSh 50 applies.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.disabledButton,
              ]}
              onPress={registerTeacher}
              disabled={loading}
            >
              <Ionicons
                name={
                  loading
                    ? 'hourglass-outline'
                    : 'phone-portrait-outline'
                }
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.registerButtonText}>
                {loading
                  ? 'Waiting for Payment...'
                  : 'Register Now'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Teachers Online • Connect. Learn. Grow.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={dropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {dropdown === 'county'
                  ? 'Select County'
                  : 'Select Sub-County'}
              </Text>

              <TouchableOpacity
                onPress={() => setDropdown(null)}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(dropdown === 'county'
                ? counties
                : subCounties
              ).map(item => {
                const value =
                  dropdown === 'county'
                    ? COUNTY_NAMES[item] || item
                    : item;

                const selected =
                  dropdown === 'county'
                    ? county === item
                    : subCounty === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.option,
                      selected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      if (dropdown === 'county') {
                        setCounty(item);
                        setSubCounty('');
                      } else {
                        setSubCounty(item);
                      }

                      setDropdown(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {value}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#059669"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },

  keyboard: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 35,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064E3B',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 21,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    marginTop: 12,
  },

  inputBox: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 10,
  },

  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 10,
  },

  placeholderText: {
    color: '#94A3B8',
  },

  levelRow: {
    gap: 8,
  },

  levelButton: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  levelButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },

  levelText: {
    marginLeft: 9,
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },

  levelTextActive: {
    color: '#FFFFFF',
  },

  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  paymentText: {
    flex: 1,
    marginLeft: 11,
  },

  paymentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },

  paymentSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 3,
    lineHeight: 17,
  },

  registerButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  disabledButton: {
    opacity: 0.65,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 9,
  },

  footer: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginTop: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '80%',
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  option: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  optionSelected: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
  },

  optionText: {
    fontSize: 15,
    color: '#334155',
  },

  optionTextSelected: {
    color: '#047857',
    fontWeight: '700',
  },
});




