# Copyright (c) 2023 beryll1um
# Distributed under the Unlicense software license, see
# the accompanying file LICENSE or https://unlicense.org.

FROM alpine:3.14

ARG USERNAME=blackout
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN addgroup --gid $USER_GID $USERNAME \
	&& adduser -u $USER_UID -G $USERNAME -D $USERNAME \
	&& apk add --no-cache git sudo curl libstdc++ \
	&& echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
	&& chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME

