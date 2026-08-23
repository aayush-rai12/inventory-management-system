import express from "express";
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

import productRoutes from "./routes/product.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import authRoutes from "./routes/auth.routes.js";
import simulateRoutes from "./routes/simulate.routes.js";

app.get('/health', (req, res)=>{
  res.json({
    success: true,
    message: 'inventory service is running'
  });
});

app.use('/products', productRoutes);
app.use('/ledger', ledgerRoutes);
app.use('/auth', authRoutes);
app.use('/simulate', simulateRoutes);

app.listen(PORT, () =>{
  console.log(`Server is running on port ${PORT}`);
});