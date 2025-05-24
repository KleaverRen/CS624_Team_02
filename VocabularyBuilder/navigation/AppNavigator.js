// navigation/AppNavigator.js
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import QuizScreen from "../screens/QuizScreen";
import ProgressTrackerScreen from "../screens/ProgressTrackerScreen";
import VocabularyBuilderScreen from "../screens/VocabularyBuilderScreen"; // Example
import SettingsScreen from "../screens/SettingsScreen";
import DashboardScreen from "../screens/DashboardScreen";

import { useAuth } from "../contexts/AuthContext"; // Adjust path as needed
const AuthStack = createStackNavigator();

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

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const MainAppNavigator = () => (
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
          iconName = focused ? "bars" : "bars";
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
);

export default function AppNavigator() {
  const { userToken, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer style={{ pointerEvents: "none" }}>
      {userToken ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
