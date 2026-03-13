# Norseus Client App

Aplicacion movil para los clientes de Norseus. Permite iniciar sesion, ver estadisticas, reservar clases y gestionar el perfil.

## Stack

| Tecnologia | Uso |
|---|---|
| Expo (React Native) | Framework movil |
| React Navigation | Navegacion (Bottom Tabs + Native Stack) |
| Zustand | Estado global |
| @react-native-firebase/* | Auth + Firestore (realtime listeners) |
| Cloud Functions | Operaciones transaccionales |

## Navegacion

```
Login Screen
     |
     v (auth success)
┌─────────────────────────────────────────┐
│           Bottom Tab Navigator           │
├──────────┬──────────┬──────────┬────────┤
│  Home    │ Reservar │Mis Clases│ Perfil │
└──────────┴──────────┴──────────┴────────┘
```

## Estructura de carpetas

```
src/
├── app/
│   └── App.tsx                    # Entry point, navigation setup
│
├── navigation/
│   ├── AuthNavigator.tsx          # Stack: Login
│   ├── MainNavigator.tsx          # Bottom Tabs
│   └── BookingNavigator.tsx       # Stack dentro del tab Reservar
│
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── booking/
│   │   ├── FacilitySelectScreen.tsx
│   │   ├── ServiceListScreen.tsx
│   │   └── ClassListScreen.tsx
│   ├── my-classes/
│   │   └── MyClassesScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
│
├── components/
│
├── services/
│
├── stores/
│
├── hooks/
│
├── config/
│   └── firebase.ts
│
└── types/
    └── navigation.ts
```

## Comandos

```bash
# Iniciar en modo desarrollo
nx start client-app

# Lint
nx lint client-app
```
