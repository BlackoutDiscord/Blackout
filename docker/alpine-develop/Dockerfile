# Copyright (c) 2023 beryll1um
# Distributed under the MIT software license, see the accompanying
# file LICENSE or http://www.opensource.org/licenses/mit-license.php

FROM alpine:3.14.10

ARG USERNAME=blackout
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Adding a new group and user only makes sense if the host user's UID/GID
# mapping to the container isn't enabled by default or isn't supported by the
# container engine. This helps not to manage the mounted volume as the root from
# the container.

RUN addgroup --gid $USER_GID $USERNAME \
	&& adduser -u $USER_UID -G $USERNAME -D $USERNAME \
	&& apk add --no-cache git sudo curl libstdc++ \
	&& echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
	&& chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME

