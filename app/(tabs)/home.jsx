import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [schedule, setSchedule] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('');
  const [attendance, setAttendance] = useState({});
  const [goal, setGoal] = useState(75);
  const [classesNeeded, setClassesNeeded] = useState(0);
  const [classesMissed, setClassesMissed] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTime, setNewClassTime] = useState('');

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedSchedule = await AsyncStorage.getItem('schedule');
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

      const savedAttendance = await AsyncStorage.getItem('attendance');
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

      const savedClasses = await AsyncStorage.getItem('classes');
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        setClasses(parsedClasses);
        calculateAttendancePercentage(parsedClasses);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const handleUploadClass = () => {
    const newClass = {
      id: `class_${Date.now()}`, // More reliable ID generation
      name: newClassName,
      time: newClassTime,
      attendance: '',
    };

    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    AsyncStorage.setItem('classes', JSON.stringify(updatedClasses));

    // Reset input fields
    setNewClassName('');
    setNewClassTime('');
    calculateAttendancePercentage(updatedClasses);
  };

  const handleMarkAttendance = (classId, attendanceStatus) => {
    const updatedAttendance = { ...attendance, [classId]: attendanceStatus };
    setAttendance(updatedAttendance);
    AsyncStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    calculateAttendancePercentage(classes);
  };

  const calculateAttendancePercentage = (currentClasses) => {
    const totalClasses = currentClasses.length;
    if (totalClasses === 0) {
      setAttendancePercentage(0);
      setClassesNeeded(0);
      setClassesMissed(0);
      return;
    }

    const attendedClasses = Object.values(attendance).filter((status) => status === 'attended').length;
    const missedClasses = Object.values(attendance).filter((status) => status === 'missed').length;
    
    const calculatedAttendancePercentage = totalClasses > 0 
      ? (attendedClasses / totalClasses) * 100 
      : 0;
    
    setAttendancePercentage(calculatedAttendancePercentage);
    
    setClassesNeeded(Math.ceil((goal / 100) * totalClasses) - attendedClasses);
    setClassesMissed(missedClasses);
  };

  const handleDeleteClass = (classId) => {
    const updatedClasses = classes.filter((cls) => cls.id !== classId);
    setClasses(updatedClasses);
    AsyncStorage.setItem('classes', JSON.stringify(updatedClasses));

    // Remove attendance for deleted class
    const updatedAttendance = { ...attendance };
    delete updatedAttendance[classId];
    setAttendance(updatedAttendance);
    AsyncStorage.setItem('attendance', JSON.stringify(updatedAttendance));

    calculateAttendancePercentage(updatedClasses);
  };

  const renderClass = ({ item }) => (
    <View style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ccc' }}>
      <Text>Class Name: {item.name}</Text>
      <Text>Time: {item.time}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Button title="Attended" onPress={() => handleMarkAttendance(item.id, 'attended')} />
        <Button title="Missed" onPress={() => handleMarkAttendance(item.id, 'missed')} />
        <Button title="Delete" color="red" onPress={() => handleDeleteClass(item.id)} />
      </View>
      <Text>Status: {attendance[item.id] || 'Not marked'}</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Schedule for {selectedDate.toLocaleDateString()}
      </Text>

      <TextInput
        placeholder="Enter class name"
        value={newClassName}
        onChangeText={setNewClassName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Enter class time"
        value={newClassTime}
        onChangeText={setNewClassTime}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button 
        title="Add Class" 
        onPress={handleUploadClass} 
        disabled={!newClassName || !newClassTime}
      />

      <FlatList
        data={classes}
        renderItem={renderClass}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No classes added yet</Text>}
        style={{ marginTop: 20 }}
      />

      <View style={{ marginTop: 20 }}>
        <Text>Attendance Summary:</Text>
        <Text>Attendance Percentage: {attendancePercentage.toFixed(2)}%</Text>
        <Text>Classes Needed to Reach Goal: {classesNeeded}</Text>
        <Text>Classes Missed: {classesMissed}</Text>
        
        <TextInput
          placeholder="Set Attendance Goal (%)"
          keyboardType="numeric"
          onChangeText={(text) => {
            const goalValue = parseInt(text);
            if (!isNaN(goalValue)) {
              setGoal(goalValue);
              calculateAttendancePercentage(classes);
            }
          }}
          style={{ borderWidth: 1, padding: 10, marginTop: 10 }}
        />
      </View>
    </View>
  );
};

export default Home;