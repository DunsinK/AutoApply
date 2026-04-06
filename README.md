# AutoApply

An open-source, privacy-first job application autofill tool powered by local AI. Think [Simplify Copilot](https://simplify.jobs/copilot), but running entirely on your machine with [Ollama](https://ollama.com/) — no data leaves your device.

## Why AutoApply?

Filling out dozens of job applications is tedious and repetitive. Tools like Simplify Copilot solve this but route your personal data through external servers. AutoApply takes a different approach:

- **Local AI** — Uses Ollama to run large language models on your own hardware. Your resume, cover letters, and personal details never leave your machine.
- **Smart Autofill** — Automatically detects and fills common job application fields (name, experience, education, skills, custom questions) using context from your profile.
- **Adaptive Responses** — Generates tailored answers for open-ended and behavioral questions based on your resume and the specific job description.
- **Free & Open Source** — No subscription, no usage limits, no vendor lock-in.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 25, Spring Boot 4, Spring MVC |
| AI Integration | Spring AI + Ollama |
| Build | Apache Maven (wrapper included) |

## Prerequisites

- **Java 25+** — [Download](https://jdk.java.net/25/)
- **Ollama** — [Install](https://ollama.com/download) and pull a model:
  ```bash
  ollama pull llama3
  ```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/AutoApply.git
   cd AutoApply/backend/autoapply
   ```

2. **Start Ollama** (if not already running)

   ```bash
   ollama serve
   ```

3. **Run the backend**

   ```bash
   ./mvnw spring-boot:run
   ```

   On Windows:

   ```cmd
   mvnw.cmd spring-boot:run
   ```

   The server starts on `http://localhost:8080` by default.

## Configuration

Application settings live in `backend/autoapply/src/main/resources/application.yaml`.

```yaml
spring:
  application:
    name: autoapply
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        model: llama3
```

| Property | Default | Description |
|----------|---------|-------------|
| `spring.ai.ollama.base-url` | `http://localhost:11434` | Ollama API endpoint |
| `spring.ai.ollama.chat.model` | `llama3` | Which Ollama model to use for generation |

## Project Structure

```
AutoApply/
└── backend/
    └── autoapply/
        ├── pom.xml                          # Maven build config & dependencies
        ├── mvnw / mvnw.cmd                  # Maven wrapper scripts
        └── src/
            ├── main/
            │   ├── java/com/dunsin/autoapply/
            │   │   └── AutoapplyApplication.java
            │   └── resources/
            │       └── application.yaml
            └── test/
                └── java/com/dunsin/autoapply/
                    └── AutoapplyApplicationTests.java
```

## Roadmap

- [ ] REST API for profile management (store resume, skills, experience)
- [ ] Ollama-powered field-matching and autofill engine
- [ ] Browser extension (Chrome/Firefox) for detecting and filling application forms
- [ ] Cover letter and custom answer generation from job descriptions
- [ ] Multi-model support (switch between Ollama models per task)
- [ ] Application tracking dashboard

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is open source. See [LICENSE](LICENSE) for details.
