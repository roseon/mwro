FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 9008
EXPOSE 9009

RUN mkdir /app/build

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
CMD ["--run-server"]