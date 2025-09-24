![Thunderbird AI Compose Banner](./assets/banner.png)

## Requires [Thunderbird AI Compose Server](https://github.com/luciferreeves/thunderbird-ai-compose-server)
You should setup the [Thunderbird AI Compose Server](https://github.com/luciferreeves/thunderbird-ai-compose-server) before using this extension. Once you have the server running, you will be provided with an endpoint URL and a Secret Key, which you will need to configure the extension.

https://github.com/user-attachments/assets/ec7c964b-af9d-47a3-a6f0-f9578a8d640a

## Installation 

### Stable Release
1. Download the latest release from the [Releases](https://github.com/luciferreeves/thunderbird-ai-compose/releases) page.
2. Open Thunderbird and go to:

    `Tools` → `Add-ons and Themes` → `Extensions` → `Install Add-on From File...`
3. Select the downloaded `.xpi` file and follow the prompts to install.
4. Restart Thunderbird to activate the extension.
5. Configure the extension by going to:

    `Tools` → `Add-ons and Themes` → `Extensions` → `Thunderbird AI Compose` → `Preferences`
6. Enter the endpoint URL and Secret Key provided by your Thunderbird AI Compose Server.
7. Save the settings and start using the AI-powered email composition features!

### Development Build

1. Clone the repository:

   ```bash
   git clone https://github.com/luciferreeves/thunderbird-ai-compose.git
   cd thunderbird-ai-compose
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Open Thunderbird and go to:

    `Tools` → `Developer Tools` → `Debug Add-ons` → `Load Temporary Add-on`


5. Select the generated `manifest.json` inside the `build/` folder.

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.
