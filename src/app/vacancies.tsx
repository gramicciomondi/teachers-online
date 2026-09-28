import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Vacancy = {
  id: string;
  teacher_id: string;
  title: string;
  school_name: string;
  county: string;
  sub_county: string | null;
  teacher_level: string;
  employment_type: string;
  description: string | null;
  contact_phone: string | null;
  created_at: string;
};

export default function VacanciesScreen() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [teacherLevel, setTeacherLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const loadVacancies = async () => {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setVacancies(data || []);
  };

  useEffect(() => {
    loadVacancies().finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadVacancies();
    setRefreshing(false);
  };

  const resetForm = () => {
    setTitle('');
    setSchoolName('');
    setCounty('');
    setSubCounty('');
    setTeacherLevel('');
    setEmploymentType('');
    setDescription('');
    setContactPhone('');
  };

  const postVacancy = async () => {
    if (
      !title.trim() ||
      !schoolName.trim() ||
      !county.trim() ||
      !teacherLevel.trim() ||
      !employmentType.trim()
    ) {
      Alert.alert(
        'Missing information',
        'Please fill in the title, school, county, teacher level and employment type.'
      );
      return;
    }

    setSaving(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        Alert.alert('Login required', 'Please log in again.');
        return;
      }

      const { error } = await supabase.from('vacancies').insert({
        teacher_id: userData.user.id,
        title: title.trim(),
        school_name: schoolName.trim(),
        county: county.trim(),
        sub_county: subCounty.trim() || null,
        teacher_level: teacherLevel.trim(),
        employment_type: employmentType.trim(),
        description: description.trim() || null,
        contact_phone: contactPhone.trim() || null,
      });

      if (error) {
        Alert.alert('Could not post vacancy', error.message);
        return;
      }

      Alert.alert('Success', 'Your teaching vacancy has been posted.');

      resetForm();
      setShowForm(false);
      await loadVacancies();
    } finally {
      setSaving(false);
    }
  };

  const deleteVacancy = (id: string) => {
    Alert.alert(
      'Delete vacancy',
      'Are you sure you want to delete this vacancy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('vacancies')
              .delete()
              .eq('id', id);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            await loadVacancies();
          },
        },
      ]
    );
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    const text = search.toLowerCase();

    return (
      vacancy.title.toLowerCase().includes(text) ||
      vacancy.school_name.toLowerCase().includes(text) ||
      vacancy.county.toLowerCase().includes(text) ||
      vacancy.teacher_level.toLowerCase().includes(text)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Loading vacancies...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase-outline" size={30} color="#166534" />
          </View>

          <Text style={styles.title}>Teaching Vacancies</Text>

          <Text style={styles.subtitle}>
            Discover teaching opportunities posted by teachers and schools.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color="#6b7280" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search vacancies..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>

        {!showForm && (
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#ffffff" />
            <Text style={styles.postButtonText}>Post a Vacancy</Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Post a Vacancy</Text>

              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close-circle" size={25} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Job title e.g. JSS English Teacher"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="School name"
              placeholderTextColor="#9ca3af"
              value={schoolName}
              onChangeText={setSchoolName}
            />

            <TextInput
              style={styles.input}
              placeholder="County"
              placeholderTextColor="#9ca3af"
              value={county}
              onChangeText={setCounty}
            />

            <TextInput
              style={styles.input}
              placeholder="Sub-county (optional)"
              placeholderTextColor="#9ca3af"
              value={subCounty}
              onChangeText={setSubCounty}
            />

            <TextInput
              style={styles.input}
              placeholder="Teacher level e.g. Primary / JSS / Senior Secondary"
              placeholderTextColor="#9ca3af"
              value={teacherLevel}
              onChangeText={setTeacherLevel}
            />

            <TextInput
              style={styles.input}
              placeholder="Employment type e.g. Full Time / Contract"
              placeholderTextColor="#9ca3af"
              value={employmentType}
              onChangeText={setEmploymentType}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the vacancy"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Contact phone (optional)"
              placeholderTextColor="#9ca3af"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={postVacancy}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={21}
                    color="#ffffff"
                  />
                  <Text style={styles.saveButtonText}>Publish Vacancy</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.resultsText}>
          {filteredVacancies.length}{' '}
          {filteredVacancies.length === 1 ? 'vacancy' : 'vacancies'}
        </Text>

        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="briefcase-outline"
              size={45}
              color="#9ca3af"
            />

            <Text style={styles.emptyTitle}>No vacancies found</Text>

            <Text style={styles.emptyText}>
              Be the first teacher to post an opportunity.
            </Text>
          </View>
        ) : (
          filteredVacancies.map((vacancy) => (
            <View key={vacancy.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons
                    name="school-outline"
                    size={25}
                    color="#166534"
                  />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.jobTitle}>{vacancy.title}</Text>

                  <Text style={styles.school}>
                    {vacancy.school_name}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detail}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.detailText}>
                    {vacancy.county}
                    {vacancy.sub_county
                      ? `, ${vacancy.sub_county}`
                      : ''}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.detailText}>
                    {vacancy.teacher_level}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.detailText}>
                    {vacancy.employment_type}
                  </Text>
                </View>
              </View>

              {vacancy.description && (
                <Text style={styles.description}>
                  {vacancy.description}
                </Text>
              )}

              {vacancy.contact_phone && (
                <View style={styles.contactRow}>
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color="#166534"
                  />
                  <Text style={styles.contactText}>
                    {vacancy.contact_phone}
                  </Text>
                </View>
              )}

              <Text style={styles.date}>
                Posted{' '}
                {new Date(vacancy.created_at).toLocaleDateString()}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteVacancy(vacancy.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#dc2626"
                />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 54,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#111827',
    fontSize: 14,
  },
  postButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 10,
    color: '#111827',
    fontSize: 14,
  },
  textArea: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  cardBody: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  school: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 13,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  description: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  date: {
    marginTop: 12,
    fontSize: 11,
    color: '#9ca3af',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
  },
});


