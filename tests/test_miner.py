from ape import project, reverts, chain
from pytest import fixture
import warnings


@fixture
def setup(accounts):
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    user3 = accounts[3]
    dev = accounts[4]
    usdt_whale = accounts[5]
    busd_whale = accounts[6]

    usdt = project.TestToken.deploy("tUSDT", "TUSDT", sender=usdt_whale)
    busd = project.TestToken.deploy("tBUSD", "TBUSD", sender=busd_whale)
    climb = project.ClimbTokenV2.deploy([usdt.address, busd.address], dev, sender=owner)
    matrix = project.BinanceWealthMatrix.deploy(climb.address, sender=owner)
    # THIS NEEDS TO HAPPEN
    usdt.transfer(climb.address, int(1e18), sender=usdt_whale)
    usdt.transfer(owner.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user1.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user2.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user3.address, 1000 * int(1e18), sender=usdt_whale)
    busd.transfer(user1.address, 1000 * int(1e18), sender=busd_whale)
    busd.transfer(user2.address, 1000 * int(1e18), sender=busd_whale)
    busd.transfer(user3.address, 1000 * int(1e18), sender=busd_whale)

    yield owner, usdt, busd, climb, user1, user2, user3, dev, matrix


def test_miner_not_initialized(setup):
    owner, usdt, _, _, user1, user2, *_, matrix = setup
    with reverts("Matrix is not initialized"):
        matrix.investInMatrix(
            user2.address, usdt.address, 100 * int(1e18), sender=user1
        )
    matrix.initializeMatrix(sender=owner)
    usdt.approve(matrix.address, 100 * int(1e18), sender=user1)
    with reverts("Only matrix allowed"):
        matrix.investInMatrix(
            user2.address, usdt.address, 100 * int(1e18), sender=user1
        )


@fixture
def initialized_setup(setup):
    owner, usdt, busd, climb, user1, user2, user3, dev, matrix = setup
    with reverts("Ownable: caller is not the owner"):
        matrix.initializeMatrix(sender=user1)
    matrix.initializeMatrix(sender=owner)
    climb.setMatrixContract(matrix.address, True, sender=owner)
    return owner, usdt, busd, climb, user1, user2, user3, dev, matrix


def test_investment(initialized_setup):
    owner, usdt, busd, climb, user1, user2, user3, dev, matrix = initialized_setup
    investment_amount = 100 * int(1e18)
    with reverts("ERC20: insufficient allowance"):
        matrix.investInMatrix(
            user2.address, usdt.address, investment_amount, sender=user1
        )

    user1_balance = usdt.balanceOf(user1.address)
    current_supply = climb.totalSupply()

    usdt.approve(matrix.address, investment_amount, sender=user1)
    matrix.investInMatrix(user2.address, usdt.address, investment_amount, sender=user1)

    climb_created = (climb.totalSupply() - current_supply) * 95 // 96
    # Since eggs in market changes, the calculation needs to be manual. And we get the 95% since there is a 5% fee
    referral_eggs = matrix.calculateTrade(climb_created, 0, 25920000000) * 95 // 100

    assert usdt.balanceOf(user1.address) == user1_balance - investment_amount
    last_interaction = chain.pending_timestamp
    miner = matrix.user(user1.address)
    miner_2 = matrix.user(user2.address)
    assert miner["totalInvested"] == climb_created
    assert miner["totalRedeemed"] == 0
    assert miner["eggsToClaim"] == 0
    assert miner["referrer"] == user2.address
    assert miner["lastInteraction"] == last_interaction - 1
    assert miner_2["totalInvested"] == 0
    assert miner_2["eggsToClaim"] == referral_eggs // 10


def test_back_to_back_investment_diff_currencies(initialized_setup):
    owner, usdt, busd, climb, user1, user2, user3, dev, matrix = initialized_setup
    investment_amount = 100 * int(1e18)
    # setup
    with reverts("ERC20: insufficient allowance"):
        matrix.investInMatrix(
            user2.address, usdt.address, investment_amount, sender=user1
        )
    usdt.approve(matrix.address, investment_amount, sender=user1)
    busd.approve(matrix.address, investment_amount, sender=user2)
    usdt.approve(matrix.address, investment_amount, sender=user3)

    user1_balance = usdt.balanceOf(user1.address)
    user2_balance = busd.balanceOf(user2.address)

    # User 2 invests BUSD with user1 as referral
    matrix.investInMatrix(user1.address, busd.address, investment_amount, sender=user2)
    market_eggs = matrix.marketEggs()
    init_supply = climb.totalSupply()
    current_matrix_climb = climb.balanceOf(matrix.address)
    # User 1 invests BUSD with user2 as referral
    matrix.investInMatrix(user2.address, usdt.address, investment_amount, sender=user1)
    user1_supply = (climb.totalSupply() - init_supply) * 95 // 96
    # calculate the amount of referral eggs to give to user 2 (10% of eggs bought)
    eggs_to_refer_1 = (
        matrix.calculateTrade(user1_supply, current_matrix_climb, market_eggs)
        * 95
        // 1000
    )

    miner_1 = matrix.user(user1.address)
    miner_2 = matrix.user(user2.address)

    current_climb_in_matrix = climb.balanceOf(matrix.address)
    # due to 5% tax it's slightly less each time as CLIMB increases in value
    assert (
        abs(
            current_climb_in_matrix
            - int((95 * int(1e18)) + (95 * int(1e18) * 97 * 100) / (100 * 101))
        )
        < 100000  # we dont really care about the last 5 least significant digits
    )
    assert miner_2["eggsToClaim"] == eggs_to_refer_1
    assert miner_1["eggsToClaim"] == 0


def test_redeem(initialized_setup):
    owner, usdt, busd, climb, user1, user2, user3, dev, matrix = initialized_setup
    investment_amount = 100 * int(1e18)
    # setup
    with reverts("ERC20: insufficient allowance"):
        matrix.investInMatrix(
            user2.address, usdt.address, investment_amount, sender=user1
        )
    usdt.approve(matrix.address, investment_amount, sender=user1)
    busd.approve(matrix.address, investment_amount, sender=user2)
    # User 2 invests BUSD with user1 as referral
    matrix.investInMatrix(user2.address, busd.address, investment_amount, sender=user2)
    # User 1 invests BUSD with user2 as referral
    matrix.investInMatrix(user1.address, usdt.address, investment_amount, sender=user1)

    miner1 = matrix.user(user1.address)
    miner2 = matrix.user(user2.address)

    chain.mine(num_blocks=1, deltatime=13 * 3600)
    #  Make sure that max EGGS is 12 hours of mining
    u1_eggs = matrix.getMiners(user1.address) * 12 * 3600
    u2_eggs = matrix.getMiners(user2.address) * 12 * 3600
    assert matrix.getEggs(user1.address) == u1_eggs
    assert matrix.getEggs(user2.address) == u2_eggs
    # Claim and make sure it matches
    usdt.balanceOf(user1.address)
    usdt.balanceOf(user2.address)
    # User 1 redeems
    u1_claimable = matrix.calculateEggSell(u1_eggs)
    price = climb.calculatePrice()
    u1_claimable = u1_claimable * price * 95 // int(1e20)
    u1_usdt = usdt.balanceOf(user1.address)
    matrix.matrixRedeem(sender=user1)
    # we dont care of 5 lsd
    assert abs(usdt.balanceOf(user1.address) - (u1_usdt + u1_claimable)) < 100000
    # User 2 redeems
    u2_claimable = matrix.calculateEggSell(u2_eggs)
    price = climb.calculatePrice()
    u2_claimable = u2_claimable * price * 95 // int(1e20)
    u2_usdt = usdt.balanceOf(user2.address)
    matrix.matrixRedeem(sender=user2)
    assert abs(usdt.balanceOf(user2.address) - (u2_usdt + u2_claimable)) < 100000

    #  How many times do we gotta make this in order to "drain" USDT
    redeemed = 0
    init_bal = usdt.balanceOf(user2.address) + busd.balanceOf(user2.address)
    for x in range(0, 120):
        chain.mine(num_blocks=1, deltatime=13 * 3600)
        # Reedeem tokens
        matrix.matrixRedeem(sender=user2)

    redeemed = (
        usdt.balanceOf(user2.address) + busd.balanceOf(user2.address)
    ) - init_bal
    matrix.matrixRedeem(sender=user1)
    assert busd.balanceOf(user1.address) > 1000 * int(1e18)


def test_reinvest(initialized_setup):
    owner, usdt, busd, climb, user1, user2, user3, dev, matrix = initialized_setup
    investment_amount = 100 * int(1e18)
    # setup
    with reverts("ERC20: insufficient allowance"):
        matrix.investInMatrix(
            user2.address, usdt.address, investment_amount, sender=user1
        )
    usdt.approve(matrix.address, investment_amount, sender=user1)
    busd.approve(matrix.address, investment_amount, sender=user2)
    # User 2 invests BUSD with user1 as referral
    matrix.investInMatrix(user2.address, busd.address, investment_amount, sender=user2)
    # User 1 invests BUSD with user2 as referral
    matrix.investInMatrix(user1.address, usdt.address, investment_amount, sender=user1)

    miner1 = matrix.user(user1.address)
    miner2 = matrix.user(user2.address)

    # for an exact + 1 miner it's +273s, however since we're takig
    chain.mine(deltatime=288)
    supply_before = climb.totalSupply()
    dev_before = climb.balanceOf(climb.owner())
    # User 2 Reinvests in matrix
    matrix.reinvestInMatrix(user2.address, sender=user2)
    miner_2_after_reinvest = matrix.user(user2.address)
    assert miner_2_after_reinvest["miners"] == miner2["miners"] + 1
    assert supply_before > climb.totalSupply()
    assert dev_before < climb.balanceOf(climb.owner())

    # Do this reinvestment every 6 hours 20 times
    for x in range(0, 20):
        chain.mine(deltatime=6 * 3600)
        matrix.reinvestInMatrix(user2.address, sender=user2)
        matrix.reinvestInMatrix(user1.address, sender=user1)
