FROM node:16.13.2

EXPOSE 3000

COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
COPY ./server/ /usr/src/app/server

WORKDIR /usr/src/app

RUN apt update && apt-get install -y libudev-dev && apt-get install libusb-1.0-0
RUN yarn --no-progress --non-interactive --frozen-lockfile

ENV COMMIT_SHA=dev
ENV API_HOST=http://localhost:3000 
ENV MIXPANEL_ENV=development 
ENV MIXPANEL_KEY=b10b850880cb0a8557d878c2e6024d03 
ENV ADROLL_ADV_ID=5VWGFTJXUZF6BPUDCH3WWM
ENV ADROLL_PIX_ID=4PSXWPAQTJEIXJSPHJCRW4
ENV MAINNET_CACHE_URL=https://oazo-bcache-mainnet-staging.new.oasis.app/api/v1
ENV ETHERSCAN_API_KEY=34JVYM6RPM3J1SK8QXQFRNSHD9XG4UHXVU 
ENV BLOCKNATIVE_API_KEY=8bdf9acf-4831-4694-87da-b2af03a303c9 
ENV INFURA_PROJECT_ID=cdcc98f6761549db8d115d62668d03af 
ENV USE_TERMS_OF_SERVICE=1 
ENV SHOW_BUILD_INFO= 
ENV NODE_ENV= 
ENV SENTRY_RELEASE=$COMMIT_SHA 
ENV NEXT_PUBLIC_SENTRY_ENV=development 
ENV SENTRY_AUTH_TOKEN=95822b50185f44cc9ae8238bb873d2681a3bfa297b3e431ebdaac5abd9ce9016 
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN echo $API_HOST

COPY . .

RUN chmod +x ./scripts/wait-for-it.sh \
&& npm run build

CMD [ "npm", "run", "start:prod" ]
