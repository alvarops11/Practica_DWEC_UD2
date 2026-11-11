import { crearApp } from './app.js';
import { leerConfiguracion } from './config.js';

const config = leerConfiguracion(process.env);
const app = await crearApp(config);
app.listen(config.puerto, () => console.log('Servidor en puerto', config.puerto));
