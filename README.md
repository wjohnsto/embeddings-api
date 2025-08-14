This app uses:

- [Express](https://expressjs.com/)
- [Hugging Face](https://github.com/huggingface/transformers) for the transformer model

## Requirements

- [bun](https://bun.sh/)
- [docker](https://www.docker.com/)
  - Optional

## Getting started

Spin up docker containers:

```bash
bun docker
```

You should have a server running on `http://localhost:8080` You can test the following request:

```sh
curl -X POST "http://localhost:8080/api/embeddings" -H "Content-Type: application/json" -d '{"values": ["hello world"], "match": ["Hello World!"]}'
```

## Running tests

There are some tests in the `__tests__` folder that can be run with the following command:

```bash
bun test
```

These tests setup and teardown on their own.

## Running locally outside docker

To run the development server outside of docker:

```bash
bun install
# then
bun dev
```

## Other Scripts

Formatting code:

```bash
bun format
```

Updating dependencies:

```bash
bun update
```
