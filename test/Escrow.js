const { ethers } = require("hardhat");
const { expect } = require("chai");

const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const bobExpectedAmount = ethers.parseEther("1.0"); //bob will get 1 ether and pay 2
const aliceExpectedAmount = ethers.parseEther("2.0");

describe("Escrow", function () {
  async function deployEscrowFixture() {
    const [owner, bob, alice, arbitrator] = await ethers.getSigners();
    const Escrow = await ethers.deployContract("Escrow");

    await Escrow.waitForDeployment();

    return { Escrow, bob, alice, arbitrator };
  }

  describe("Deployment", function () {
    it("Should create a new agreement", async function () {
      console.log("deploying escrow");

      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      const agreement = await Escrow.agreements(0);
      //console.log(agreement[0]);

      expect(agreement.bob).to.equal(bob.address);
      expect(agreement.alice).to.equal(alice.address);
      expect(agreement.arbitrator).to.equal(arbitrator.address);
      expect(agreement.bobExpectedAmount).to.equal(bobExpectedAmount);
      expect(agreement.aliceExpectedAmount).to.equal(aliceExpectedAmount);
      expect(agreement.bobIn).to.equal(false);
      expect(agreement.aliceIn).to.equal(false);
    });
  });

  describe("Deposit", function () {
    it("Should allow Bob to deposit funds", async function () {
      // const bobExpectedAmount = ethers.parseEther("1.0");
      // const aliceExpectedAmount = ethers.parseEther("2.0");
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      // Create a new agreement from the arbitrator's account
      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      //Bob deposit
      await Escrow.connect(bob).deposit(0, { value: aliceExpectedAmount });

      //check if bob deposit state is true
      const agreement = await Escrow.agreements(0);
      expect(agreement.bobIn).to.equal(true);
    });

    it("Should allow Alice to deposit funds", async function () {
      const bobExpectedAmount = ethers.parseEther("1.0");
      const aliceExpectedAmount = ethers.parseEther("2.0");
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      // Create a new agreement from the arbitrator's account
      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      //Bob deposit
      await Escrow.connect(alice).deposit(0, { value: bobExpectedAmount });

      //check if alice deposit state is true
      const agreement = await Escrow.agreements(0);
      expect(agreement.aliceIn).to.equal(true);
    });

    it("Should throw error when Bob tries to deposit wrong amount", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      await expect(
        Escrow.connect(bob).deposit(0, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Bob has not paid what Alice expected");
    });

    it("Should throw error when Alice tries to deposit wrong amount", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      await expect(
        Escrow.connect(alice).deposit(0, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Alice has not paid what Bob expected");
    });
  });

  describe("Refund", function () {
    it("Should allow Bob to refund funds", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      //bob Deposits funds
      await Escrow.connect(bob).deposit(0, { value: aliceExpectedAmount });

      //bob requests refund
      await Escrow.connect(bob).refund(0, { value: aliceExpectedAmount });

      //Check alice deposit state
      const agreement = await Escrow.agreements(0);
      expect(agreement.bobIn).to.equal(false);
    });

    it("Should allow Alice to refund funds", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      //alice Deposits funds
      await Escrow.connect(alice).deposit(0, { value: bobExpectedAmount });

      //alice requests refund
      await Escrow.connect(alice).refund(0, { value: bobExpectedAmount });

      //Check alice deposit state
      const agreement = await Escrow.agreements(0);
      expect(agreement.aliceIn).to.equal(false);
    });

    it("Should throw error when Bob tries to refund wrong amount", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );
      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      await Escrow.connect(bob).deposit(0, { value: aliceExpectedAmount });

      await expect(
        Escrow.connect(bob).refund(0, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Invalid refund");
    });

    it("Should throw error when Alice tries to refund wrong amount", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );
      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      await Escrow.connect(alice).deposit(0, { value: bobExpectedAmount });

      await expect(
        Escrow.connect(alice).refund(0, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Invalid refund");
    });
  });

  describe("Completing agreement", function () {
    it("Should only allow the arbitror to complete the agreement", async function () {
      const { Escrow, bob, alice, arbitrator } = await loadFixture(
        deployEscrowFixture
      );

      await Escrow.connect(arbitrator).newAgreement(
        bob.address,
        alice.address,
        bobExpectedAmount,
        aliceExpectedAmount
      );

      await Escrow.connect(bob).deposit(0, { value: aliceExpectedAmount });
      await Escrow.connect(alice).deposit(0, { value: bobExpectedAmount });

      //Non-arbitror tries to complete agreement
      await expect(Escrow.connect(bob).complete(0)).to.be.revertedWith(
        "Only arbitrator can complete"
      );
    });
  });
});
