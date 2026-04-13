import app from './app/app.js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});