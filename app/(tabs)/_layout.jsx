import { View, Text, Image } from 'react-native'
import { Tabs, Redirect} from 'expo-router';

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {

  return (
    <View className="items-center justify-center gap-2 mt-4">
      <Image 
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
        style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}
      />
      <Text className={`${focused ? 'font-psemibold pt-1' : 'font-pregular'} text-xs`} style={{ color: color, fontSize: focused ? 15 : 12 }}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
        <Tabs
          screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#90EE90',
                tabBarInactiveTintColor: '#CDCDE0',
                tabBarStyle: {
                  backgroundColor: '#161622',
                  borderTopWidth: 1,
                  borderTopColor: '#232533',
                  height: 84,
                }
          }}
        >
            <Tabs.Screen
                name="home"
                options={{ title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                      <TabIcon
                        icon={icons.home}
                        color={color}
                        name="Home"
                        focused={focused}
                      />
                    )
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{ title: 'Stats',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                      <TabIcon
                        icon={icons.bookmark}
                        color={color}
                        name="Stats"
                        focused={focused}
                      />
                    )
                }}
            />
            <Tabs.Screen
                name="sproutai"
                options={{ title: 'SproutAI',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                      <TabIcon
                        icon={icons.plus}
                        color={color}
                        name="SproutAI"
                        focused={focused}
                      />
                    )
                }}
            />
            <Tabs.Screen
                name="locations"
                options={{ title: 'Links',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                      <TabIcon
                        icon={icons.profile}
                        color={color}
                        name="Links"
                        focused={focused}
                      />
                    )
                }}
            />
        </Tabs>
    </>
  )
}

export default TabsLayout