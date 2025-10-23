<p align="center">
  <a href="https://magicinspector.com"><img src="./.readme/cover.png" alt="Magic Inspector"></a>
</p>

<p align="center">
    <em>.</em>
</p>

<p align=center>
Your Open-Source AI Web Testing Agent — Auto Inspector is an autonomous AI Agent that will test your website and give you a report of the results based on your user stories.
</p>

<p align="center">
Auto Inspector is made by the <a href="https://magicinspector.com">Magic Inspector</a> team to change the way web testing is done.
</p>

<p align=center>
Focus on planning your tests, we run them for you.
</p>

<p align="center">
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License version">
</a>
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/Status-Under Active Development-green.svg" alt="Docker Image CI">
</a>
</p>

<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>


# Open-Source Web Testing AI Agent

Auto Inspector is <b>fully open-sourced (Apache 2.0)</b> and <a href="https://magicinspector.com">Magic Inspector</a> offers cloud hosting and dedicated enterprise grade support.


## Demo 

### GUI VERSION

https://github.com/user-attachments/assets/98881b79-eb63-4d10-aedf-f52ad64aecd5

### CLI VERSION

User story: I can log in to my account with 'demo@magicinspector.com' and 'demopassword' and create a new test inside the Default Project. Once the test has been created, I can see the test editor.

https://github.com/user-attachments/assets/7873f6a8-89d5-4234-8a17-0d993f5dc5c7

## How it works

<p align="center">
  <a href="https://magicinspector.com"><img src="./.readme/how-it-works.png" alt="agentlabs.dev"></a>
</p>

## Getting Started

ℹ️ Note: Auto Inspector is currently in development and not ready to self-host. If you're looking for an enterprise-grade testing solution, check our **[Cloud Version](https://magicinspector.com)**.

Auto Inspector is available as a CLI utility and as a web application.
- The GUI web version is the easiest way to get started if you just to play with the agent.
- The CLI is probably more adapted to improve the agent and add new features to the core.

### GUI Version

#### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Docker
- Docker Compose

You can download Docker from [here](https://www.docker.com/products/docker-desktop) and Docker Compose from [here](https://docs.docker.com/compose/install/).


#### Clone the repository

```bash
git clone https://github.com/magic-inspector/auto-inspector.git
cd auto-inspector
```

#### Add your OpenAI API key in your .env file

```bash
echo OPENAI_API_KEY="<replace-with-your-key>" >> .env
```

#### Run the web application

```bash
make up
```

or to run in detached mode

```bash
make upd
make logs
```

This command will start the web application at `http://localhost`.


### CLI Version

#### Prerequisites

ℹ️ Note: Auto Inspector requires Node.js version 20 or higher.


#### Clone the repository and go to the backend folder

```bash
git clone https://github.com/magic-inspector/auto-inspector.git
cd auto-inspector/backend

npm install
```

#### Add your OpenAI API key

```
echo OPENAI_API_KEY="<replace-with-your-key>" >> .env
```

#### Run an example test case

```
npm run example:voyager
```

#### Run your own test case

```
npm run scenario -- --url="start-url" --user-story="As a user, I can <replace-with-your-user-story>"
```

## Roadmap for a stable release

We're committed to improving the project, feel free to open an issue if you have any suggestions or feedback.

| Component                                                  | Status | Features                                                                                                                                                                                      |
| :--------------------------------------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alpha release                                              |   ✅️️    | <ul><li>Release a first minimap version that is able to run a test</li></ul>                                                                                                                  |
| Add support for variables and secrets                      |   ✅️️    | <ul><li>The agent can take variables and secrets from the user story</li><li>Secrets are not displayed in the logs or sent to the LLM</li></ul>                                               |
| Run multiple cases from a test file                        |   ✅️️    | <ul><li>Check the `npm run example:file` command for more information</li></ul>                                                                                                               |
| Interrupt actions when dom changes                         |   ✅️    | <ul><li>We need to interrupt the action if the interactives elements change after one action</li></ul>                                                                                        |
| Wait page stabilized before evaluation                     |   ✅️    | <ul><li>Wait for the domContentLoaded event to be fired</li><li>Wait for a minimal time to make sure the page is stable</li></ul>                                                             |
| Manage completion at the action level                      |   ✅️    | <ul><li>We must manage completion at the action level instead of the task level to make sure the agent does not restart filling inputs over and over</li></ul>                                |
| Update UI version to display steps in real-time            |   🏗️    | <ul><li>Update the UI to show the steps generated by the agent in real-time</li></ul>                                                                                                         |
| Add unit tests                                             |   🏗️    | <ul><li>Add vitest to test business logic</li></ul>                                                                                                                                           |
| Manager multiple tabs                                      |   🏗️    | <ul><li>We must listen to the tab events and manage the tabs</li></ul>                                                                                                                        |
| Persist voyager results in file                            |   🏗️    | <ul><li>we need to persist screenshots and results in a file for every test we run</li></ul>                                                                                                  |
| Refine user inputs                                         |   🏗️    | <ul><li>We must make sure that the Manager Agent and the Evaluation Agent get distinct inputs so the Manager Agent does not try to update its behavior based on the expected result</li></ul> |
| Provide a GUI                                              |   🏗️    | <ul><li>Add docker configuration</li><li>Add a simple UI to create a test</li></ul>                                                                                                           |
| Build a serious benchmark framework                        |   🏗️    | <ul><li>The only serious way to improve the agent is to build a serious benchmark dedicated to the web testing.</li></ul>                                                                     |
| Add OpenAI YAML spec and generate frontend SDK dynamically |   🏗️    | <ul><li>Automatically add OpenAI YAML specification</li><li>Generate frontend SDK dynamically based on the specification</li></ul>                                                            |





<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>

## Development

1. npm install for frontend and backend
2. install playwright in backend
```sh
npx playwright install
```