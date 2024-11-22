const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 4000;


app.use(cors());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'yellow_taxi',
  password: 'postgres',
  port: 5432,
});


app.get('/api/trips', async (req, res) => {
  const { minFare, maxFare, maxDistance, paymentType, startTime, endTime } = req.query;

  try {
    let query = 'SELECT * FROM yellow_taxi_trips WHERE 1=1';
    const params = [];

    if (minFare) {
      params.push(minFare);
      query += ` AND fare_amount >= $${params.length}`;
    }
    if (maxFare) {
      params.push(maxFare);
      query += ` AND fare_amount <= $${params.length}`;
    }
    if (maxDistance) {
      params.push(maxDistance);
      query += ` AND trip_distance <= $${params.length}`;
    }
    if (paymentType) {
      params.push(paymentType);
      query += ` AND payment_type = $${params.length}`;
    }
    if (startTime) {
      params.push(startTime);
      query += ` AND pickup_datetime >= $${params.length}`;
    }
    if (endTime) {
      params.push(endTime);
      query += ` AND pickup_datetime <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    const trips = result.rows.map((trip) => ({
      id: trip.id,
      pickup: { lat: trip.pickup_latitude, lng: trip.pickup_longitude },
      dropoff: { lat: trip.dropoff_latitude, lng: trip.dropoff_longitude },
      fare: trip.fare_amount,
      distance: trip.trip_distance,
      paymentType: trip.payment_type,
      time: trip.pickup_datetime,
    }));

    res.json(trips);
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error);
    res.status(500).send('Failed to fetch data');
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
