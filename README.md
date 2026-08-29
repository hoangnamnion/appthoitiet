# Thoi Tiet - Hoang Tien, Thanh Hoa

App thoi tiet cho Hoang Tien, Thanh Hoa. Du lieu tu Open-Meteo (mien phi, khong can API key).

## Tinh nang
- Thoi tiet hien tai (nhiet do, do am, gio, UV, luong mua)
- Du bao theo gio (24 gio tiep theo)
- Du bao 2 ngay toi
- Keo xuong de lam moi (Pull-to-refresh)
- Giao dien chuan iOS/Android

## Cai dat APK Android

1. Vao tab **Releases** ben phai
2. Tai file `weather-app-debug.apk`
3. Tren dien thoai Android: **Cai dat -> Bao mat -> Bat "Cho phep cai tu nguon khong ro"**
4. Mo file APK va cai

## Build tu source

### Yeu cau
- Node.js >= 18
- Android Studio (cho Android)
- Xcode (cho iOS, chi tren macOS)

### Cac buoc

```bash
# Cai dependencies
npm install

# Chay web app
# Mo index.html trong trinh duyet

# Build Android
npx cap add android
npx cap sync android
npx cap open android
# -> Trong Android Studio: Build > Generate APK

# Build iOS (can macOS + Xcode)
npx cap add ios
npx cap sync ios
npx cap open ios
# -> Trong Xcode: Product > Archive
```

## GitHub Actions (Tu dong build)

Moi lan push len `main`:
- **Android APK** tu dong build va upload len Releases
- **iOS** build tren macOS runner

Xem ket qua tai tab **Actions** tren GitHub.

## Cong nghe
- HTML / CSS / JavaScript (Vanilla)
- [Capacitor](https://capacitorjs.com/) - Native wrapper
- [Open-Meteo API](https://open-meteo.com/) - Du lieu thoi tiet mien phi
