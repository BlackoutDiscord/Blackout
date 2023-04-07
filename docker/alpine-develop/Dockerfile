# Copyright (c) 2023 beryll1um
# Distributed under the Unlicense software license, see
# the accompanying file LICENSE or https://unlicense.org.

FROM alpine:3.14

ARG USERNAME=blackout
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Default Docker engine does not support isolated namespaces or
# namespace mapping. To avoid creating new files with root-only access, we
# create a new user inside the container and assign it the most commonly
# used UID and GID of the host's home user. This ensures that any files
# created by the container will be accessible by the host user.

# But, for example, the Podman engine maps the namespace of the launching user
# to the container user by default, so our new user won't be able to use the
# mounted directory. Please remove user creation or set "userns" to "keep-id"
# in container.conf or create an executable proxy for vscode.

RUN addgroup --gid $USER_GID $USERNAME \
	&& adduser -u $USER_UID -G $USERNAME -D $USERNAME \
	&& apk add --no-cache git sudo curl libstdc++ \
	&& echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
	&& chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME

