import { View, Text } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function DashboardScreen() {
  const { signOut } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Finik Farma Dashboard</Text>
      <Text className="mt-4 text-primary" onPress={() => signOut()}>Odhlásiť sa</Text>
    </View>
  );
}
