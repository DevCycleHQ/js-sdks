import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

import java.io.FileReader;
import java.io.IOException;

public class RhinoTest {
    public static void main(String[] args) {
        Context context = Context.enter();
        try {
            Scriptable scope = context.initStandardObjects();
            FileReader scriptFile = new FileReader("dist/sdk/nodejs/main.js");
            context.evaluateReader(scope, scriptFile, "JavaScript", 1, null);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            Context.exit();
        }
    }
}
