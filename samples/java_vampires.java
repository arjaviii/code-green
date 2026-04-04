import java.util.LinkedList;
import java.util.List;

public class JavaVampires {
    public void processData() {
        // VAMPIRE: LinkedList used for iteration-heavy task
        List<String> data = new LinkedList<>();
        
        for (int i = 0; i < 1000; i++) {
            data.add("Item " + i);
        }

        // VAMPIRE: Inefficient loop pattern
        for (int i = 0; i < data.size(); i++) {
            System.out.println(data.get(i));
        }
    }
}
