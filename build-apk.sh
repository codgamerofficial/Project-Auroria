#!/bin/bash

echo "========================================"
echo "   Auroria AI - Android APK Builder"
echo "========================================"
echo

echo "Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "❌ Java JDK not found!"
    echo
    echo "Please install Java JDK first:"
    echo "1. Download from: https://adoptium.net/"
    echo "2. Install JDK 11 or higher"
    echo "3. Set JAVA_HOME environment variable"
    echo "4. Add Java bin folder to PATH"
    echo
    echo "Example: export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64"
    echo
    exit 1
fi

echo "✅ Java found! Version:"
java -version
echo

echo "Checking Android project..."
if [ ! -d "android" ]; then
    echo "❌ Android project not found!"
    echo "Please run: npx cap add android"
    exit 1
fi

echo "✅ Android project found!"
echo

echo "Syncing web assets..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Failed to sync web assets!"
    exit 1
fi

echo "✅ Web assets synced!"
echo

echo "Building APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ APK build failed!"
    cd ..
    exit 1
fi

cd ..
echo "✅ APK build successful!"
echo

echo "========================================"
echo "🎉 APK Generated Successfully!"
echo "========================================"
echo
echo "📱 APK Location:"
echo "   SunoAI/android/app/build/outputs/apk/debug/app-debug.apk"
echo
echo "📋 Installation Instructions:"
echo "1. Transfer the APK file to your Android device"
echo "2. Enable 'Install from unknown sources' in settings"
echo "3. Open the APK file on your device"
echo "4. Install and enjoy Auroria AI!"
echo
echo "🚀 App Features:"
echo "• AI Music Generation"
echo "• Portfolio Showcase"
echo "• Collaborative Studio"
echo "• Audio Export Tools"
echo "• Futuristic UI"
echo