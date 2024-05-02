const express = require('express');
const router = express.Router();
const fs = require('fs');

// Load JSON data
const address = require('./data/address.json');
const order = require('./data/order.json');

router.get('/lowest-business-date', (req, res) => {
  try {
    // Assuming order is an array of orders in order.json

    // Create an object to store total order amounts for each date
    const totalOrderAmounts = {};

    // Calculate total order amounts for each date
    order.forEach((order) => {
      const orderDate = order.OrderDate;
      const orderAmount = parseInt(order.OrderAmount);

      if (!totalOrderAmounts[orderDate]) {
        totalOrderAmounts[orderDate] = 0;
      }

      totalOrderAmounts[orderDate] += orderAmount;
    });

    // Find the date with the lowest total order amount
    let lowestDate;
    let lowestAmount = Infinity;

    for (const date in totalOrderAmounts) {
      if (totalOrderAmounts[date] < lowestAmount) {
        lowestAmount = totalOrderAmounts[date];
        lowestDate = date;
      }
    }

    // Send the response
    res.json({ date: lowestDate });
  } catch (error) {
    console.error('Error processing lowest-business-date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/week-wise-sales', (req, res) => {
    try {
      // Assuming order is an array of orders in order.json
  
      // Create an object to store week-wise sales for each customer type
      const weekWiseSales = {};
  
      // Calculate week-wise sales for each customer type
      order.forEach((order) => {
        const orderDate = new Date(order.OrderDate);
        const weekNumber = getWeekNumber(orderDate);
        const customerType = order.CustomerType;
        const orderAmount = parseInt(order.OrderAmount);
  
        if (!weekWiseSales[customerType]) {
          weekWiseSales[customerType] = {};
        }
  
        if (!weekWiseSales[customerType][weekNumber]) {
          weekWiseSales[customerType][weekNumber] = 0;
        }
  
        weekWiseSales[customerType][weekNumber] += orderAmount;
      });
  
      // Send the response
      res.json(weekWiseSales);
    } catch (error) {
      console.error('Error processing week-wise-sales:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Function to get the ISO week number of a date
  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  router.get('/percentage-change-business', (req, res) => {
    try {
      // Assuming order is an array of orders in order.json
  
      // Sort orders by order date
      const sortedOrders = order.sort((a, b) => new Date(a.OrderDate) - new Date(b.OrderDate));
  
      // Create an object to store percentage change for each week
      const percentageChange = {};
  
      // Calculate percentage change between each week
      for (let i = 1; i < sortedOrders.length; i++) {
        const currentOrder = sortedOrders[i];
        const previousOrder = sortedOrders[i - 1];
  
        const currentAmount = parseInt(currentOrder.OrderAmount);
        const previousAmount = parseInt(previousOrder.OrderAmount);
  
        const weekNumber = getWeekNumber(new Date(currentOrder.OrderDate));
  
        if (!percentageChange[weekNumber]) {
          percentageChange[weekNumber] = 0;
        }
  
        if (previousAmount !== 0) {
          percentageChange[weekNumber] += ((currentAmount - previousAmount) / previousAmount) * 100;
        }
      }
  
      // Send the response
      res.json(percentageChange);
    } catch (error) {
      console.error('Error processing percentage-change:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Function to get the ISO week number of a date
  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  router.get('/unique-customers', (req, res) => {
    try {
      // Assuming order is an array of orders in order.json
  
      // Create an object to store total order value for each customer
      const customerOrderTotal = {};
  
      // Iterate through orders to calculate total order value for each customer
      order.forEach(orderItem => {
        const customerId = orderItem.CustomerID;
        const orderAmount = parseInt(orderItem.OrderAmount);
  
        if (!customerOrderTotal[customerId]) {
          customerOrderTotal[customerId] = {
            address: getAddressById(customerId),
            totalOrderValue: 0,
          };
        }
  
        customerOrderTotal[customerId].totalOrderValue += orderAmount;
      });
  
      // Convert the object to an array for response
      const resultArray = Object.keys(customerOrderTotal).map(customerId => ({
        customer: {
          id: customerId,
          address: customerOrderTotal[customerId].address,
        },
        totalOrderValue: customerOrderTotal[customerId].totalOrderValue,
      }));
  
      // Send the response
      res.json(resultArray);
    } catch (error) {
      console.error('Error processing unique-customers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Function to get address by customer ID
  function getAddressById(customerId) {
    const customerAddress = address.find(addr => addr.CustomerID === customerId);
    return customerAddress ? customerAddress.Address : null;
  }
  
  router.get('/highest-retail-market', (req, res) => {
    try {
        // Read the order.json file
        const orderData = JSON.parse(fs.readFileSync('./data/order.json', 'utf-8'));

        // Create an object to store total sales for each location (state/city)
        const totalSalesByLocation = {};

        // Calculate total sales for each location
        orderData.forEach(order => {
            // Check if 'ShippingAddress' is defined and has 'State' property
            const location = order.ShippingAddress && order.ShippingAddress.State
                ? order.ShippingAddress.State
                : order.ShippingAddress && order.ShippingAddress.City
                ? order.ShippingAddress.City
                : 'Unknown';

            const orderAmount = parseInt(order.OrderAmount);

            if (!totalSalesByLocation[location]) {
                totalSalesByLocation[location] = 0;
            }

            totalSalesByLocation[location] += orderAmount;
        });

        // Find the location with the highest total sales
        let highestLocation;
        let highestSales = 0;

        for (const location in totalSalesByLocation) {
            if (totalSalesByLocation[location] > highestSales) {
                highestSales = totalSalesByLocation[location];
                highestLocation = location;
            }
        }

        // Send the response
        res.json({ location: highestLocation, totalSales: highestSales });
    } catch (error) {
        console.error('Error processing highest-retail-market:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});  
module.exports = router;
