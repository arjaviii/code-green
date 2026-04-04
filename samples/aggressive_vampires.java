import java.util.*;

public class AggressiveVampires {
    public static void main(String[] args) {
        // 1. Generic LinkedList (Should be caught by upgraded rule)
        List<Map<String, Integer>> complexList = new LinkedList<Map<String, Integer>>();
        
        // 2. Inefficient String Concat in Loop (Aggressive check)
        String report = "";
        for (int i = 0; i < 1000; i++) {
            report += "Vampire found at " + i + "\n";
        }
        
        // 3. keySet() + get() iteration (Intellectual check)
        Map<String, String> config = new HashMap<>();
        for (String key : config.keySet()) {
            System.out.println(key + " = " + config.get(key));
        }
        
        // 4. Redundant String object
        String wasteful = new String("This is energy-intensive!");
    }
}
