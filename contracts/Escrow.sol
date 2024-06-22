//SPDX-License-Identifier: MIT
//Adapted from: https://github.com/jamesbachini/Solidity-Snippets/blob/main/contracts/escrow.sol
pragma solidity ^0.8.0;

contract Escrow {
    struct Agreement {
        address bob;
        address alice;
        address arbitrator;
        uint bobExpectedAmount; //in wei, what Bob expects to receive
        uint aliceExpectedAmount; //in wei, what Alice expects to receive
        bool bobIn;
        bool aliceIn;
        bool completed;
    }

    Agreement[] public agreements;

    function getAgreement(
        uint256 index
    )
        external
        view
        returns (
            address bob,
            address alice,
            address arbitrator,
            uint bobExpectedAmount,
            uint aliceExpectedAmount,
            bool bobIn,
            bool aliceIn,
            bool completed
        )
    {
        Agreement storage agreement = agreements[index];
        return (
            agreement.bob,
            agreement.alice,
            agreement.arbitrator,
            agreement.bobExpectedAmount,
            agreement.aliceExpectedAmount,
            agreement.bobIn,
            agreement.aliceIn,
            agreement.completed
        );
    }

    function newAgreement(
        address _bob,
        address _alice,
        uint _bobExpectedAmount,
        uint _aliceExpectedAmount
    ) external returns (uint) {
        require(_bob != _alice, "same buyer and seller");
        agreements.push(
            Agreement(
                _bob,
                _alice,
                msg.sender,
                _bobExpectedAmount,
                _aliceExpectedAmount,
                false,
                false,
                false
            )
        );
        return agreements.length - 1;
    }

    function deposit(uint _id) external payable {
        if (
            msg.sender == agreements[_id].bob &&
            msg.value == agreements[_id].aliceExpectedAmount
        ) {
            //bob payed what alice expected
            agreements[_id].bobIn = true;
        } else if (
            msg.sender == agreements[_id].bob &&
            msg.value != agreements[_id].aliceExpectedAmount
        ) {
            revert("Bob has not paid what Alice expected");
        } else if (
            msg.sender == agreements[_id].alice &&
            msg.value == agreements[_id].bobExpectedAmount
        ) {
            //alice payed what bob expected
            agreements[_id].aliceIn = true;
        } else if (
            msg.sender == agreements[_id].alice &&
            msg.value != agreements[_id].bobExpectedAmount
        ) {
            revert("Alice has not paid what Bob expected");
        }
    }

    function refund(uint _id) external payable {
        if (
            msg.sender == agreements[_id].bob &&
            msg.value == agreements[_id].aliceExpectedAmount
        ) {
            agreements[_id].bobIn = false;
            payable(agreements[_id].bob).transfer(
                agreements[_id].aliceExpectedAmount
            );
        } else if (
            msg.sender == agreements[_id].alice &&
            msg.value == agreements[_id].bobExpectedAmount
        ) {
            agreements[_id].aliceIn = false;
            payable(agreements[_id].alice).transfer(
                agreements[_id].bobExpectedAmount
            );
        } else {
            revert("Invalid refund");
        }
    }

    function complete(uint _id) external payable {
        require(
            msg.sender == agreements[_id].arbitrator,
            "Only arbitrator can complete"
        );
        require(agreements[_id].bobIn = true, "Bob has not paid");
        require(agreements[_id].aliceIn = true, "Alice has not paid");

        payable(agreements[_id].bob).transfer(
            agreements[_id].aliceExpectedAmount
        );
        payable(agreements[_id].alice).transfer(
            agreements[_id].bobExpectedAmount
        );

        //Reset agreement state after completion
        agreements[_id].bobIn = false;
        agreements[_id].aliceIn = false;

        //Set completed flag to true
        agreements[_id].completed = true;
    }
}
