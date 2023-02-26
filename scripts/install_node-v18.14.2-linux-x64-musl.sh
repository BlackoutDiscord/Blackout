#!/bin/sh

# Copyright (c) 2023 beryll1um
# Distributed under the Unlicense software license, see
# the accompanying file LICENSE or https://unlicense.org.

PKG_NAME=node
PKG_VERSION=v18.14.2
PKG_PLATFORM=linux-x64-musl
PKG_DIR=$PKG_NAME-$PKG_VERSION-$PKG_PLATFORM
PKG_ARCHIVE=$PKG_DIR.tar.xz
PKG_URL=https://unofficial-builds.nodejs.org/download/release/$PKG_VERSION/$PKG_ARCHIVE
PKG_HASH=96d95e426ca110dd667de37746d6feb58c6e131f612296e550017b449eec7f21

usage() {
	cat <<EOF
Usage: ${0##*/} [-hic]

Downloads and installs unofficial node.js for
linux-x64 platform for an environment compatible with
the musl libc implementation.

	-i	Download and install node.js
	-c	Cleanup all temporary files
EOF
}

die() { echo $@ >&2; exit 1; }

[ $(command -v "curl") ] || die "This script depends on 'curl' utility, please install it to use script."
[ $(command -v "sha256sum") ] || die "This script depends on 'sha256sum' utility, please install it to use script."
[ $(command -v "tar") ] || die "This script depends on 'curl' utility, please install it to use script."

if [ -z $1 ] || [ $1 = "-h" ] || [ $1 = "--help" ]; then
	usage
	exit $(( $# ? 0 : 1 ))
fi

while getopts 'ic' OPTION; do
	case $OPTION in
		i)
			INSTALL=1
			;;
		c)
			CLEANUP=1
			;;
		?)
			usage
			exit 1
			;;
	esac
done
shift $(( OPTIND - 1 ))

if [ $# -ne 0 ]; then
	usage
	exit 1
fi

if [ -n $INSTALL ]; then
	if [ $(id -u) -eq 0 ]; then
		SUDO=""
	elif [ $(command -v "sudo") ]; then
		SUDO="sudo"
	else
		die "Unable to install package without superuser rights!"
	fi
	curl -O $PKG_URL 2>/dev/null
	if [ $? -ne 0 ]; then
		die "Failed to download package."
	fi
	echo "$PKG_HASH  $PKG_ARCHIVE" | sha256sum -c 2>/dev/null
	if [ $? -ne 0 ]; then
		die "The hash of the downloaded package does not coincide with the hash from the installation script."
	fi
	tar -xvf $PKG_ARCHIVE 2>/dev/null
	if [ $? -ne 0 ]; then
		die "Failed to unarchive a downloaded package."
	fi
	$SUDO cp -rf $PKG_DIR/*/ /usr/local/ 2>/dev/null
	if [ $? -ne 0 ]; then
		die "Failed to install package."
	fi
fi

if [ -n $CLEANUP ]; then
	rm -r $PKG_ARCHIVE $PKG_DIR
fi

