#!/bin/bash

# Energy Today - Automated Build Script
# This script starts an EAS build with automatic keystore generation

export EXPO_TOKEN="m7GyLbhhhqc5h-DIICtRpiJnNf_FQ0_PHGodfsRQ"

cd /home/ubuntu/energy_today

echo "Starting Energy Today build..."
echo ""
echo "This will:"
echo "1. Generate a new Android keystore automatically"
echo "2. Start the build on Expo servers"
echo "3. Give you a link to monitor progress"
echo ""

# Use expect to handle interactive prompts
expect << 'EOF'
set timeout 300
spawn eas build --platform android --profile production --no-wait
expect {
    "Generate a new Android Keystore?" {
        send "y\r"
        exp_continue
    }
    "Build ID:" {
        puts "\n✅ Build started successfully!"
    }
    timeout {
        puts "\n⏱️ Build command timed out"
        exit 1
    }
    eof
}
EOF

echo ""
echo "✅ Build submitted! Check status at:"
echo "https://expo.dev/accounts/rotchana/projects/energy_today/builds"
