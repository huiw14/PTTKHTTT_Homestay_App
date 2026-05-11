import dotenv from 'dotenv';

dotenv.config({ quiet: true });

import app from './app/app.js';

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 5000}`);
});