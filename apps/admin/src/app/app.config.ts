import { ApplicationConfig, provideZonelessChangeDetection, ErrorHandler, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideLogger, GlobalErrorHandler } from '@front/utils';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { NgxEditorModule } from 'ngx-editor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideLogger({ production: environment.production }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideAnimations(),
    importProvidersFrom(
      NgxEditorModule.forRoot({
        locals: {
          bold: 'Negrita',
          italic: 'Cursiva',
          code: 'Código',
          underline: 'Subrayado',
          strike: 'Tachado',
          blockquote: 'Cita',
          bullet_list: 'Lista con viñetas',
          ordered_list: 'Lista numerada',
          heading: 'Encabezado',
          h1: 'Encabezado 1',
          h2: 'Encabezado 2',
          h3: 'Encabezado 3',
          h4: 'Encabezado 4',
          h5: 'Encabezado 5',
          h6: 'Encabezado 6',
          align_left: 'Alinear izquierda',
          align_center: 'Centrar',
          align_right: 'Alinear derecha',
          align_justify: 'Justificar',
          text_color: 'Color del texto',
          background_color: 'Color de fondo',
          insertLink: 'Insertar enlace',
          removeLink: 'Quitar enlace',
          undo: 'Deshacer',
          redo: 'Rehacer',
          url: 'URL',
          text: 'Texto',
          openInNewTab: 'Abrir en nueva pestaña',
          insert: 'Insertar',
          remove: 'Quitar',
          enterValidUrl: 'Por favor ingrese una URL válida',
        },
      }),
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
  ],
};

registerLocaleData(localeEs);
