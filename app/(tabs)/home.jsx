import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  StyleSheet,
  Modal,
  Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#3498db',
  background: '#f4f6f9',
  text: '#2c3e50',
  attended: '#2ecc71',
  missed: '#e74c3c',
  neutral: '#95a5a6'
};

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [goal, setGoal] = useState(75);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', time: '' });
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedClasses = await AsyncStorage.getItem('classes');
      const savedAttendance = await AsyncStorage.getItem('attendance');
      
      if (savedClasses) setClasses(JSON.parse(savedClasses));
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addNewClass = () => {
    if (!newClass.name.trim() || !newClass.time.trim()) return;

    const classToAdd = {
      id: `class_${Date.now()}`,
      ...newClass
    };

    const updatedClasses = [...classes, classToAdd];
    setClasses(updatedClasses);
    AsyncStorage.setItem('classes', JSON.stringify(updatedClasses));

    // Reset modal and new class state
    setNewClass({ name: '', time: '' });
    setAddModalVisible(false);
  };

  const markAttendance = (classId, status) => {
    const updatedAttendance = { ...attendance, [classId]: status };
    setAttendance(updatedAttendance);
    AsyncStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    calculateAttendancePercentage(classes, updatedAttendance);
  };

  const calculateAttendancePercentage = (currentClasses, currentAttendance) => {
    const totalClasses = currentClasses.length;
    if (totalClasses === 0) {
      setAttendancePercentage(0);
      return;
    }

    const attendedClasses = Object.values(currentAttendance || {})
      .filter(status => status === 'attended').length;
    
    const percentage = (attendedClasses / totalClasses) * 100;
    setAttendancePercentage(percentage);
  };

  const renderClassItem = ({ item }) => {
    const status = attendance[item.id];
    
    return (
      <View style={styles.classItem}>
        <View style={styles.classDetails}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classTime}>{item.time}</Text>
        </View>
        <View style={styles.attendanceButtons}>
          <TouchableOpacity 
            style={[
              styles.attendanceButton, 
              status === 'attended' && styles.attendedButton
            ]}
            onPress={() => markAttendance(item.id, 'attended')}
          >
            <Text style={styles.attendanceButtonText}>Attended</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.attendanceButton, 
              status === 'missed' && styles.missedButton
            ]}
            onPress={() => markAttendance(item.id, 'missed')}
          >
            <Text style={styles.attendanceButtonText}>Missed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Tracker</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance Overview */}
      <View style={styles.attendanceOverview}>
        <Text style={styles.attendancePercentageText}>
          {attendancePercentage.toFixed(1)}%
        </Text>
        <Text style={styles.attendanceSubtext}>Attendance Rate</Text>
      </View>

      {/* Class List */}
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No classes added yet</Text>
          </View>
        }
        contentContainerStyle={styles.classList}
      />

      {/* Add Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setAddModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            <TextInput
              style={styles.input}
              placeholder="Class Name"
              value={newClass.name}
              onChangeText={(text) => setNewClass(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Class Time"
              value={newClass.time}
              onChangeText={(text) => setNewClass(prev => ({ ...prev, time: text }))}
            />
            <TouchableOpacity 
              style={styles.modalAddButton} 
              onPress={addNewClass}
            >
              <Text style={styles.modalAddButtonText}>Add Class</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300'
  },
  attendanceOverview: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  attendancePercentageText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary
  },
  attendanceSubtext: {
    fontSize: 16,
    color: COLORS.neutral
  },
  classList: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  classItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  classDetails: {
    flex: 1
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  },
  classTime: {
    fontSize: 14,
    color: COLORS.neutral,
    marginTop: 5
  },
  attendanceButtons: {
    flexDirection: 'row'
  },
  attendanceButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral
  },
  attendedButton: {
    backgroundColor: COLORS.attended,
    borderColor: COLORS.attended
  },
  missedButton: {
    backgroundColor: COLORS.missed,
    borderColor: COLORS.missed
  },
  attendanceButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50
  },
  emptyStateText: {
    color: COLORS.neutral,
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: COLORS.text
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  modalAddButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Home;