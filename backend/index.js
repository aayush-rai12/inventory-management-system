import express from "express";
import cors from "cors";
  
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

import productRoutes from "./routes/product.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import authRoutes from "./routes/auth.routes.js";
import simulateRoutes from "./routes/simulate.routes.js";
import resetRoutes from "./routes/reset.routes.js";
import { startConsumer } from "./kafka/consumer.js";

app.get('/', (req, res)=>{
  res.json({
    success: true,
    message: 'inventory service is running'
  });
});

app.use('/products', productRoutes);
app.use('/ledger', ledgerRoutes);
app.use('/auth', authRoutes);
app.use('/simulate', simulateRoutes);
app.use('/reset', resetRoutes);

app.listen(PORT, () =>{
  console.log(`Server is running on port ${PORT}`);
  startConsumer();
});