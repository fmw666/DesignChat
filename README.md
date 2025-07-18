<div align="center"><img src="./images/top_image.png" alt="License" width="800px" /></div>

<br />

<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-d9d9d9?style=for-the-badge&color=0078D4"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-d9d9d9?style=for-the-badge&color=1AAD19"></a>
</p>

`DesignChat AI` is a powerful AI image generation platform that supports multiple models and custom prompts, empowering efficient creation.

| Node.js | NPM |
| :-----  | :-- |
| v22.14.0 | v11.2.0 |

## ✨ Features

- 🎨 Multi-model AI image generation
- 🔄 Real-time generation preview
- 📱 Mobile-first responsive design
- 🔒 User authentication and authorization
- 💾 History saving
- 🗃️ Remote image storage

## 🛠️ Tech Stack

| Technology | Version | Description |
|------|------|------|
| ![React](https://img.shields.io/badge/React-18.2.0-20232a?logo=react&logoColor=61DAFB&labelColor=20232a) | 18.2.0 | UI library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript&logoColor=white&labelColor=3178C6) | 5.2.2 | Type-safe JavaScript extension |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-0ea5e9?logo=tailwindcss&logoColor=white&labelColor=0ea5e9) | 3.4.1 | Utility-first CSS framework |
| ![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite&logoColor=FFD62E&labelColor=646CFF) | 6.3.5 | Next-gen frontend build tool |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=3ECF8E&labelColor=222) | - | Open-source Firebase alternative |
| ![Vercel](https://img.shields.io/badge/Vercel-Deploy-222222?logo=vercel&logoColor=white&labelColor=111111) | - | Frontend deployment platform |

## 🚀 Quick Start

💡 This project uses `supabase` for the backend. You need to create a `supabase` project and configure environment variables.

### 🖥️ Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/fmw666/DesignChat.git
cd DesignChat
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Initialize Supabase project

- Log in to [Supabase](https://supabase.com/) and create a project.
- Refer to the following docs to obtain various keys:
  - **Database (db) key:** [See db key doc](./docs/supabase/db/README.md)
  - **Auth key:** [See auth key doc](./docs/supabase/auth/README.md)
  - **Storage key:** [See storage key doc](./docs/supabase/storage/README.md)
- It is recommended to use the script to initialize all Supabase tables, auth, storage, etc. in one click.
  - Run locally:
    ```bash
    npm install && npm run init
    ```
  - Run with Docker (no local Node required):
    ```bash
    docker run --rm -v %cd%:/app -w /app node:20 npm run init
    ```
- For script details and more usage, see [Init Script Guide](./scripts/README.md)

#### 4. Configure environment variables

> Obtain the required keys from your Supabase project

```bash
cp .env.example .env
# Edit the .env file and fill in the required environment variables
```

#### 5. Start the development server

```bash
npm run dev
```

#### 6. Jest test

```bash
npm run test
```

#### 7. Lint test

```bash
npm run lint
```

### ☁️ One-Click Deploy

| Method | Scenario & Description |
|------|------|
| [![Deploy with Vercel by clone](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesignChat) | Clone this repo directly to your `Vercel` account, suitable for first-time deployment or full project copy |
| [![Deploy with Vercel by import](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesignChat&teamSlug=maovos-projects) | Import this repo into your `Vercel` project, suitable for existing Vercel projects or team collaboration |

Click the button above and follow these steps to deploy:

1. Log in or register a `Vercel` account
2. Import the GitHub repository
3. Configure environment variables
4. Click deploy

## 📝 TODO

> Items that are done but not yet removed are marked with ✅.

### 🧩 Feature Design

1. User agreement and privacy: Add user agreement and privacy content to the login dialog
1. Model config info: Complete model info documentation
1. Model config support: Support more model APIs
1. Image-to-image: Optimize image-to-image experience, support model config
1. Asset library refactor: Optimize asset library loading and interaction
1. Image API management: Error code and message i18n management
1. Model config linkage: Real-time effect on modelStore when config changes
1. System prompt: Add system prompt feature for models
1. Model testing: Support model testing feature
1. Doubao API management: Separate ark/apiKey management for 3.0 and base models
1. API proxy protocol: Use vite proxy in dev, direct API in prod

### ⚡ Performance Optimization

1. Merge API requests: Use Supabase Edge Functions to merge DB requests
1. Bundle splitting: Fine-grained chunking with rollupOptions
1. Image optimization: Thumbnails, lazy loading, progressive loading, preloading
1. Code cleanup: Remove redundant code, optimize structure
1. IndexedDB: Optimize query performance using the browser IndexedDB

### 🎬 Animation & Theme

1. Animation performance optimization
1. Theme management: Global dark theme config, reduce style duplication

### 🎈 Lint

1. Handle `npm run lint` errors and warnings

## 🤝 Contributing

For those who want to contribute, please refer to our [Contribution Guide](./CONTRIBUTING.md).

**Contributors**

<a href="https://github.com/fmw666/DesignChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fmw666/DesignChat" />
</a>

## 📄 License

MIT License - see [LICENSE](LICENSE) for details
