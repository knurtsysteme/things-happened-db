FROM ubuntu:16.04
MAINTAINER Daniel Oltmanns

# Setup basic environment
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -y install apt-transport-https ca-certificates

# add node repo
RUN echo "" >> /etc/apt/sources.list
RUN echo "deb http://deb.nodesource.com/node_5.x trusty main" >> /etc/apt/sources.list

# install requirements
RUN apt-get update
RUN apt-get -y --allow-unauthenticated install \
  nano \
  nodejs


# copy everything into src directory
RUN mkdir /src
COPY src /src
WORKDIR /src

# install node packages
RUN npm install --production

EXPOSE 3001

CMD ["nodejs", "/src/app.js"]
