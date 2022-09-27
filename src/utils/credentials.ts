import * as os from "os";
import * as keytar from "keytar";

async function getDeploifaiCredentials() {
  if (os.platform() === "darwin" || os.platform() === "win32") {
    const deploifaiVSCodeCredentials = await keytar.findCredentials(
      "deploifai-vscode"
    );
    if (deploifaiVSCodeCredentials.length) {
      return deploifaiVSCodeCredentials[0];
    } else {
      const deploifaiCLICredentials = await keytar.findCredentials(
        "deploifai-cli"
      );
      if (deploifaiCLICredentials.length) {
        // Add the deploifai-cli credentials to deploifai-vscode as well for persistence
        await keytar.setPassword(
          "deploifai-vscode",
          deploifaiCLICredentials[0].account,
          deploifaiCLICredentials[0].password
        );
        return deploifaiCLICredentials[0];
      } else {
        return null;
      }
    }
  } else {
    const deploifaiVSCodeCredentials = await keytar.findCredentials(
      "deploifai-vscode"
    );
    if (deploifaiVSCodeCredentials.length) {
      return deploifaiVSCodeCredentials[0];
    } else {
      return null;
    }
  }
}

export default getDeploifaiCredentials;
