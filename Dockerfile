FROM node:8
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY lib /usr/app/lib
COPY src /usr/app/src
COPY gitInfo.json gulpfile.js package.json tsconfig.json /usr/app/
RUN npm config set strict-ssl false
RUN sed -i '/shared-git-hooks/d' ./package.json
RUN npm install
RUN node_modules/gulp/bin/gulp.js
EXPOSE 8080
CMD ["node", "release/server.js"]
