// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrderBook {
    struct Order {
        address user;
        uint256 price;
        uint256 amount;
        bool isBuyOrder;
    }

    // Mapping of orders by order ID
    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    // Events for order actions
    event OrderPlaced(
        uint256 orderId,
        address user,
        uint256 price,
        uint256 amount,
        bool isBuyOrder
    );
    event TradeExecuted(
        uint256 buyOrderId,
        uint256 sellOrderId,
        uint256 amount,
        uint256 price
    );

    // Place a new order (buy or sell)
    function placeOrder(
        uint256 price,
        uint256 amount,
        bool isBuyOrder
    ) public returns (uint256) {
        orders[orderCount] = Order({
            user: msg.sender,
            price: price,
            amount: amount,
            isBuyOrder: isBuyOrder
        });

        emit OrderPlaced(orderCount, msg.sender, price, amount, isBuyOrder);
        return orderCount++;
    }

    // Fetch order by ID
    function getOrder(uint256 orderId) public view returns (Order memory) {
        return orders[orderId];
    }

    // Execute a trade between a buy and sell order
    function executeTrade(
        uint256 buyOrderId,
        uint256 sellOrderId,
        uint256 amount
    ) public {
        Order storage buyOrder = orders[buyOrderId];
        Order storage sellOrder = orders[sellOrderId];

        require(buyOrder.isBuyOrder, "Buy order is invalid");
        require(!sellOrder.isBuyOrder, "Sell order is invalid");
        require(buyOrder.price >= sellOrder.price, "Price mismatch");
        require(
            buyOrder.amount >= amount && sellOrder.amount >= amount,
            "Insufficient amount"
        );

        // Update the orders' amounts
        buyOrder.amount -= amount;
        sellOrder.amount -= amount;

        emit TradeExecuted(buyOrderId, sellOrderId, amount, sellOrder.price);
    }

    // Fetch all orders (just a basic view to list orders)
    function getAllOrders() public view returns (Order[] memory) {
        Order[] memory allOrders = new Order[](orderCount);
        for (uint256 i = 0; i < orderCount; i++) {
            allOrders[i] = orders[i];
        }
        return allOrders;
    }
}
