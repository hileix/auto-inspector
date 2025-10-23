# Auto-Inspector Backend API Documentation

## Overview
The Auto-Inspector backend is a NestJS application that provides APIs for running automated browser tests using AI agents. The backend orchestrates test execution, manages browser interactions, and reports results.

---

## API Endpoints

### 1. **POST `/jobs/test.run`**
Triggers a new test run based on a user story.

**Request Body:**
```json
{
  "userStory": "string - Description of the test scenario",
  "startUrl": "string - The URL where the test should start"
}
```

**Response:**
```json
{
  "sessionUrl": "string - WebSocket URL for VNC connection (e.g., ws://localhost:6080/websockify)",
  "password": "string - Password for VNC session access"
}
```

**Description:**
- Accepts a user story and starting URL
- Creates a new test session
- Returns VNC connection details for real-time monitoring
- Internally triggers the manager agent to parse the user story and orchestrate test execution

**Location:** `src/interfaces/api/jobs/jobs.controller.ts`

---

## Architecture Overview

### Directory Structure

```
backend/
├── src/
│   ├── app/                          # Application use cases
│   ├── core/                         # Core business logic
│   ├── infra/                        # Infrastructure services
│   ├── interfaces/                   # API & CLI interfaces
│   └── test/                         # Test files
├── Configuration Files               # ESLint, TypeScript, etc.
└── Docker Setup                      # Dockerfile for containerization
```

---

## Core Modules

### 1. **App Module** (`src/app/usecases/`)
Defines high-level use cases for the application.

| File | Purpose |
|------|---------|
| `run-test-case.ts` | Executes individual test cases |
| `run-from-file.ts` | Executes tests from file-based specifications |

---

### 2. **Core Module** (`src/core/`)
Contains the core business logic and entities.

#### **Agents** (`src/core/agents/`)

**Manager Agent** (`manager-agent/`)
- Orchestrates the overall test execution flow
- Parses user stories into actionable steps
- Coordinates with evaluation agent
- **Files:**
  - `manager-agent.ts` - Main agent implementation
  - `manager-agent.prompt.ts` - LLM prompts for the agent
  - `manager-agent.config.ts` - Configuration settings
  - `manager-agent.types.ts` - TypeScript type definitions

**Evaluation Agent** (`evaluation-agent/`)
- Evaluates test results and determines pass/fail status
- Analyzes test outcomes
- Compares expected vs actual results
- **Files:**
  - `evaluation-agent.ts` - Main agent implementation
  - `evaluation-agent.prompt.ts` - LLM prompts for evaluation
  - `evaluation-agent.types.ts` - TypeScript type definitions

#### **Entities** (`src/core/entities/`)
Core data structures for the application.

| Entity | Purpose |
|--------|---------|
| `task.ts` | Defines task structure and properties |
| `test-result.ts` | Stores test execution results |
| `variable.ts` | Manages test variables and state |
| `variable-string.ts` | Handles string interpolation for variables |

#### **Interfaces** (`src/core/interfaces/`)
Contract definitions for services.

| Interface | Purpose |
|-----------|---------|
| `llm.interface.ts` | Language model interface for AI integration |
| `browser.interface.ts` | Browser automation interface contract |
| `screenshotter.interface.ts` | Screenshot capture interface |
| `reporter.interface.ts` | Test reporting interface |
| `agent-reporter.interface.ts` | Agent execution reporting interface |
| `file-system.interface.ts` | File system abstraction for storage operations |

#### **Services** (`src/core/services/`)
Core business logic services.

| Service | Purpose |
|---------|---------|
| `task-manager-service.ts` | Manages task queuing and execution |

#### **Task Manager** (`src/core/task-manager/`)
- `task-manager.interface.ts` - Task manager contract definition

#### **Utilities** (`src/core/shared/`)
- `utils.ts` - Common utility functions

---

### 3. **Infrastructure Module** (`src/infra/services/`)
Implements interfaces and provides external service integrations.

| Service | Purpose | Technology |
|---------|---------|------------|
| `chromium-browser.ts` | Browser automation and navigation | Playwright / Chromium |
| `openai4o.ts` | AI language model integration | OpenAI GPT-4o |
| `playwright-screenshotter.ts` | Screenshot capture during test execution | Playwright |
| `dom-service.ts` | DOM inspection and manipulation | Playwright DOM API |
| `in-memory-file-system.ts` | In-memory file storage for test assets | Node.js memory |
| `ora-reporter.ts` | Console-based test progress reporting | Ora CLI spinner |

---

### 4. **Interfaces Module** (`src/interfaces/`)

#### **API Interface** (`src/interfaces/api/`)
NestJS HTTP API implementation.

**Main Application**
- `main.ts` - Application entry point and server initialization
- `app.module.ts` - Root NestJS module with dependency injection
- `app.controller.ts` - Application-level routes
- `app.service.ts` - Application-level business logic

**Jobs Module** (`jobs/`)
Handles test job execution and management.

- `jobs.controller.ts` - HTTP request handlers for job endpoints
- `jobs.service.ts` - Business logic for job execution
- `jobs.module.ts` - NestJS module configuration
- `dtos/run.test.dto.ts` - Data Transfer Object for test run requests

**DTOs** (`jobs/dtos/`)
- `run.test.dto.ts` - Defines the request/response structure for test execution
  - Contains `userStory` and `startUrl` properties
  - Type-safe parameter validation

#### **CLI Interface** (`src/interfaces/cli/`)
Command-line interface for local test execution.

- `index.ts` - CLI entry point
- `commands/index.ts` - Available CLI commands

#### **Worker** (`src/interfaces/worker/`)
- `index.ts` - Background worker implementation

---

## Test Coverage

### Unit Tests
- `src/interfaces/api/jobs/jobs.controller.spec.ts` - Controller unit tests
- `src/interfaces/api/jobs/jobs.service.spec.ts` - Service unit tests

### End-to-End Tests
- `test/app.e2e-spec.ts` - Complete application flow tests
- `test/jest-e2e.json` - Jest configuration for E2E tests

---

## Key Workflow

```
1. User submits test request via POST /jobs/test.run
   └─ Request contains: userStory, startUrl
   
2. Jobs Controller receives and validates request
   └─ Uses RunTestDto for type safety
   
3. Jobs Service processes the request
   └─ Creates a new test session
   
4. Manager Agent is invoked
   └─ Parses user story into actionable steps
   └─ Coordinates overall test execution
   
5. Chromium Browser executes test steps
   └─ Navigates to URLs
   └─ Interacts with DOM elements
   
6. Playwright Screenshotter captures screenshots
   └─ Stores visual evidence of test execution
   
7. Evaluation Agent analyzes results
   └─ Compares expected vs actual outcomes
   └─ Determines test pass/fail status
   
8. Test Results are compiled
   
9. VNC Session URL returned to frontend
   └─ sessionUrl: WebSocket connection for real-time monitoring
   └─ password: Credentials for VNC viewer access
   
10. Real-time monitoring via VNC
    └─ Frontend connects to ws://localhost:6080/websockify
    └─ User watches test execution in real-time
    
11. Test Results reported via Reporter interface
    └─ Ora Reporter outputs progress to console
```

---

## Configuration Files

### Build Configuration
- `tsconfig.json` - TypeScript compiler options for runtime
- `tsconfig.build.json` - TypeScript compiler options for production build
- `nest-cli.json` - NestJS CLI configuration

### Code Quality
- `.eslintrc.js` - ESLint configuration for code linting
- `.prettierrc` - Prettier configuration for code formatting

### Environment
- `.env.example` - Template for environment variables
  - Contains placeholders for OpenAI API keys, port configuration, etc.

### Containerization
- `Dockerfile` - Production Docker image
- `Dockerfile.dev` - Development Docker image with hot-reload support

### Package Management
- `package.json` - Node.js dependencies and scripts
- `.npmrc` - NPM registry configuration (if needed)
- `.gitignore` - Git ignore patterns

---

## Dependencies & Technologies

### Core Framework
- **NestJS** - Progressive Node.js framework for building efficient APIs

### AI Integration
- **OpenAI GPT-4o** - Language model for intelligent test orchestration
- **LLM Interface** - Abstraction layer for AI provider switching

### Browser Automation
- **Playwright** - Cross-browser automation library
- **Chromium** - Headless browser engine

### Testing & Quality
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Reporting & Logging
- **Ora** - Elegant terminal spinner for progress reporting

### File System
- **In-Memory FS** - For test asset storage and retrieval

---

## Environment Variables

Create a `.env` file based on `.env.example` with the following:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o

# Server Configuration
PORT=3000
NODE_ENV=development

# VNC Server Configuration
VNC_PORT=6080
VNC_PASSWORD=secret

# Optional: Logging Level
LOG_LEVEL=debug
```

---

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up
```

### Run Tests
```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Data Flow Diagram

```
Frontend (Svelte)
    │
    ├─→ POST /jobs/test.run
    │
Backend (NestJS)
    │
    ├─→ Jobs Controller
    │   ├─→ Validate Request (DTO)
    │   └─→ Jobs Service
    │
    ├─→ Manager Agent
    │   ├─→ Parse User Story (OpenAI)
    │   ├─→ Generate Test Steps
    │   └─→ Coordinate Execution
    │
    ├─→ Chromium Browser
    │   ├─→ Navigate to URL
    │   ├─→ Interact with DOM
    │   └─→ Capture Screenshots
    │
    ├─→ Evaluation Agent
    │   ├─→ Analyze Results (OpenAI)
    │   └─→ Determine Pass/Fail
    │
    └─→ Return Response
        ├─→ sessionUrl (VNC WebSocket)
        └─→ password (VNC Credentials)
        
Frontend (Real-time Monitoring)
    │
    └─→ Connect to VNC Session
        └─→ Watch Test Execution
```

---

## API Response Examples

### Success Response
```json
{
  "sessionUrl": "ws://localhost:6080/websockify",
  "password": "secret"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "error": "Bad Request"
}
```

---

## Best Practices

1. **User Stories**: Write clear, detailed user stories that describe the expected user behavior
2. **Start URLs**: Always provide valid, accessible URLs
3. **Error Handling**: Monitor VNC session for test failures and debugging
4. **Performance**: Keep test scenarios focused to avoid timeout issues
5. **Security**: Use environment variables for sensitive configuration

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection timeout | Ensure backend is running on `http://localhost:3000` |
| VNC connection failed | Check `VNC_PORT` configuration and firewall settings |
| OpenAI API errors | Verify `OPENAI_API_KEY` is set correctly in `.env` |
| Browser automation issues | Ensure Chromium/Playwright dependencies are installed |

---

## Future Enhancements

- [ ] WebSocket support for real-time test progress updates
- [ ] Test history and analytics dashboard
- [ ] Multi-browser support (Firefox, Safari)
- [ ] Parallel test execution
- [ ] Custom test scenario templates
- [ ] Integration with CI/CD pipelines

---

## Support & Documentation

- **GitHub Repository**: [auto-inspector](https://github.com/hileix/auto-inspector)
- **NestJS Documentation**: https://docs.nestjs.com/
- **Playwright Documentation**: https://playwright.dev/
- **OpenAI API Documentation**: https://platform.openai.com/docs/
