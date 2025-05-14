import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";

import VocabularyBuilderScreen from "./screens/VocabularyBuilderScreen";
import QuizScreen from "./screens/QuizScreen";
import ProgressTrackerScreen from "./screens/ProgressTrackerScreen";
import SettingsScreen from "./screens/SettingsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import { ThemeProvider } from "./contexts/ThemeContext";

const Tab = createBottomTabNavigator();

const Dashboard = createNativeStackNavigator();
const VocabularyStack = createNativeStackNavigator();
const QuizStack = createNativeStackNavigator();
const ProgressStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <Dashboard.Navigator>
      <Dashboard.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
    </Dashboard.Navigator>
  );
}

function VocabularyStackNavigator() {
  return (
    <VocabularyStack.Navigator>
      <VocabularyStack.Screen
        name="Vocabulary"
        component={VocabularyBuilderScreen}
        options={{ headerShown: false }}
      />
    </VocabularyStack.Navigator>
  );
}

function QuizStackNavigator() {
  return (
    <QuizStack.Navigator>
      <QuizStack.Screen
        name="QuizHome"
        component={QuizScreen}
        options={{ headerShown: false }}
      />
    </QuizStack.Navigator>
  );
}

function ProgressStackNavigator() {
  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen
        name="ProgressHome"
        component={ProgressTrackerScreen}
        options={{ headerShown: false }}
      />
    </ProgressStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="DashboardTab"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "DashboardTab") {
                iconName = focused ? "home" : "home";
              } else if (route.name === "VocabularyTab") {
                iconName = focused ? "list-alt" : "list-alt";
              } else if (route.name === "QuizTab") {
                iconName = focused ? "question-circle" : "question-circle";
              } else if (route.name === "ProgressTab") {
                iconName = focused ? "chart-bar" : "chart-bar";
              } else if (route.name === "SettingsTab") {
                iconName = focused ? "cog" : "cog";
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "dark",
            tabBarInactiveTintColor: "gray",
            headerShown: false, // Hide the default header for tab screens
          })}
        >
          <Tab.Screen
            name="DashboardTab"
            component={HomeStackNavigator}
            options={{ title: "Dashboard" }}
          />
          <Tab.Screen
            name="VocabularyTab"
            component={VocabularyStackNavigator}
            options={{ title: "Vocabulary" }}
          />
          <Tab.Screen
            name="QuizTab"
            component={QuizStackNavigator}
            options={{ title: "Quiz" }}
          />
          <Tab.Screen
            name="ProgressTab"
            component={ProgressStackNavigator}
            options={{ title: "Progress" }}
          />
          <Tab.Screen
            name="SettingsTab"
            component={SettingsStackNavigator}
            options={{ title: "Settings" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
