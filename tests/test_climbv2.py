from ape import project, reverts, Contract
import pytest
import warnings

router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"


@pytest.fixture
def setup(accounts):
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    user3 = accounts[3]
    dev = accounts[4]
    usdt_whale = accounts[5]
    busd_whale = accounts[6]

    usdt = project.TestToken.deploy(sender=usdt_whale)
    busd = project.TestToken.deploy(sender=busd_whale)
    climb = project.ClimbTokenV2.deploy([usdt.address], dev, sender=owner)

    # THIS NEEDS TO HAPPEN
    usdt.transfer(climb.address, int(1e18), sender=usdt_whale)
    usdt.transfer(owner.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user1.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user2.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user3.address, 1000 * int(1e18), sender=usdt_whale)
    busd.transfer(user1.address, 1000 * int(1e18), sender=busd_whale)
    busd.transfer(user2.address, 1000 * int(1e18), sender=busd_whale)
    busd.transfer(user3.address, 1000 * int(1e18), sender=busd_whale)

    yield owner, usdt, busd, climb, user1, user2, user3, busd_whale, usdt_whale, dev


def test_buy_tokens_self_usdt(setup):
    owner, usdt, busd, climb, user1, *_ = setup

    current_supply = climb.totalSupply()
    amount_to_buy = 100 * int(1e18)

    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=user1)
    # Test failure because it needs to be activated first
    with reverts("Locked Inside the Matrix"):
        climb.buy(amount_to_buy, usdt.address, sender=user1)
    # Since it's a normie trying to buy, token must be activated
    climb.ActivateToken(sender=owner)
    climb.buy(amount_to_buy, usdt.address, sender=user1)

    assert usdt.balanceOf(climb.address) == amount_to_buy + int(1e18)
    assert climb.totalSupply() == current_supply + amount_to_buy * 96 // 100
    assert climb.balanceOf(user1.address) == amount_to_buy * 95 // 100
    pass


def test_buy_tokens_other_usdt(setup):
    owner, usdt, busd, climb, user1, user2, *_ = setup

    current_supply = climb.totalSupply()
    amount_to_buy = 100 * int(1e18)

    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=user1)
    # Test failure because it needs to be activated first
    with reverts("Locked Inside the Matrix"):
        climb.buy(user2.address, amount_to_buy, usdt.address, sender=user1)
    # Since it's a normie trying to buy, token must be activated
    climb.ActivateToken(sender=owner)
    climb.buy(user2.address, amount_to_buy, usdt.address, sender=user1)

    assert usdt.balanceOf(climb.address) == amount_to_buy + int(1e18)
    assert climb.totalSupply() == current_supply + amount_to_buy * 96 // 100
    assert climb.balanceOf(user2.address) == amount_to_buy * 95 // 100
    assert climb.balanceOf(user1.address) == 0
    pass


def test_erc_transfer_no_fee(setup):
    owner, usdt, busd, climb, user1, *_ = setup

    amount_to_buy = 100 * int(1e18)
    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=owner)
    # Owner doesnt need activation to buy
    climb.buy(amount_to_buy, usdt.address, sender=owner)

    owner_supply = climb.balanceOf(owner.address)
    amount_to_send = owner_supply // 2

    climb.transfer(user1.address, amount_to_send, sender=owner)

    assert climb.balanceOf(owner.address) == owner_supply - amount_to_send
    assert climb.balanceOf(user1.address) == amount_to_send  # no fee

    pass


def test_erc_transfer_with_fee(setup):
    owner, usdt, busd, climb, user1, user2, *_ = setup

    amount_to_buy = 100 * int(1e18)
    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=owner)
    # Owner doesnt need activation to buy
    climb.buy(amount_to_buy, usdt.address, sender=owner)

    owner_supply = climb.balanceOf(owner.address)
    amount_to_send = owner_supply // 2

    climb.transfer(user1.address, amount_to_send, sender=owner)

    climb.transfer(user2.address, amount_to_send, sender=user1)

    assert climb.balanceOf(user1.address) == 0  # sent all the tokens he has
    assert (
        abs(climb.balanceOf(user2.address) - amount_to_send * 95 // 100) < 1000
    )  # 5% transfer fee with a tiny diff acceptable because of math stuff

    pass


def test_sell_tokens_self_usdt_no_tax(setup):
    owner, usdt, busd, climb, *_, dev = setup

    amount_to_buy = 100 * int(1e18)
    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=owner)

    climb.ActivateToken(sender=owner)
    climb.buy(amount_to_buy, usdt.address, sender=owner)

    # get amounts previous of sell
    prev_supply = climb.totalSupply()
    prev_climb_balance = climb.balanceOf(owner.address)
    prev_usdt_balance = usdt.balanceOf(climb.address)
    prev_usdt_owner_balance = usdt.balanceOf(owner.address)
    prev_climb_dev_balance = climb.balanceOf(dev.address)

    amount_to_sell = 10 * int(1e18)

    amount_to_receive = climb.calculatePrice() * (amount_to_sell - 100) // int(1e18)

    sell_tx = climb.sell(amount_to_sell, usdt.address, sender=owner)

    # get amounts after of sell
    current_supply = climb.totalSupply()
    current_climb_balance = climb.balanceOf(owner.address)
    current_usdt_balance = usdt.balanceOf(climb.address)
    current_usdt_owner_balance = usdt.balanceOf(owner.address)
    current_climb_dev_balance = climb.balanceOf(dev.address)

    assert current_supply == prev_supply - amount_to_sell  # no tax
    assert current_climb_balance == prev_climb_balance - amount_to_sell
    assert current_climb_dev_balance == prev_climb_dev_balance  # no tax
    assert (
        abs(current_usdt_balance - (prev_usdt_balance - amount_to_receive)) < 1000
    )  # acceptable differences due to internal math
    assert (
        abs(current_usdt_owner_balance - (prev_usdt_owner_balance + amount_to_receive))
        < 1000  # acceptable differences due to internal math
    )
    pass


def test_sell_tokens_self_usdt_tax(setup):
    owner, usdt, busd, climb, user1, *_, dev = setup

    amount_to_buy = 100 * int(1e18)
    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=user1)

    climb.ActivateToken(sender=owner)
    climb.buy(amount_to_buy, usdt.address, sender=user1)

    # get current amounts previous of sell
    prev_supply = climb.totalSupply()
    prev_climb_balance = climb.balanceOf(user1.address)
    prev_usdt_balance = usdt.balanceOf(climb.address)
    prev_usdt_user1_balance = usdt.balanceOf(user1.address)
    prev_climb_dev_balance = climb.balanceOf(dev.address)

    amount_to_sell = 10 * int(1e18)
    amount_to_receive = (
        climb.calculatePrice() * (amount_to_sell * 95 // 100) // int(1e18)
    )

    climb.sell(amount_to_sell, usdt.address, sender=user1)

    assert climb.totalSupply() == prev_supply - (amount_to_sell * 99 // 100)
    assert climb.balanceOf(user1.address) == prev_climb_balance - amount_to_sell
    # tax gets sent to dev
    assert climb.balanceOf(dev.address) >= prev_climb_dev_balance + (
        amount_to_sell // 100
    )
    assert (
        abs(
            usdt.balanceOf(user1.address)
            - (prev_usdt_user1_balance + amount_to_receive)
        )
        < 1000
    )
    pass


def test_sell_all_tokens_usdt(setup):
    owner, usdt, busd, climb, user1, *_, dev = setup

    amount_to_buy = 100 * int(1e18)
    # need to approve usdt first
    usdt.approve(climb.address, amount_to_buy, sender=user1)

    climb.ActivateToken(sender=owner)
    climb.buy(amount_to_buy, usdt.address, sender=user1)

    # get current amounts previous of sell
    prev_supply = climb.totalSupply()
    prev_usdt_balance = usdt.balanceOf(climb.address)
    prev_usdt_user1_balance = usdt.balanceOf(user1.address)
    prev_climb_dev_balance = climb.balanceOf(dev.address)

    amount_to_sell = climb.balanceOf(user1.address)
    amount_to_receive = (
        climb.calculatePrice() * (amount_to_sell * 95 // 100) // int(1e18)
    )

    # calculated data
    calculated_supply = prev_supply - (amount_to_sell * 99 // 100)
    calculated_dev_balance = prev_climb_dev_balance + (amount_to_sell // 100)
    calculated_usdt_balance = prev_usdt_balance - amount_to_receive
    calculated_usdt_user1_balance = prev_usdt_user1_balance + amount_to_receive

    with reverts("Stable Not Active"):
        climb.sellAll(busd.address, sender=user1)

    climb.setStableToken(busd.address, True, sender=owner)

    with reverts("Not enough of STABLE"):
        climb.sellAll(busd.address, sender=user1)
    climb.sellAll(usdt.address, sender=user1)

    # current data
    current_supply = climb.totalSupply()
    current_climb_balance = climb.balanceOf(user1.address)
    current_usdt_balance = usdt.balanceOf(climb.address)
    current_usdt_user1_balance = usdt.balanceOf(user1.address)
    current_climb_dev_balance = climb.balanceOf(dev.address)

    assert current_climb_balance == 0
    assert abs(current_supply - calculated_supply) < 1000
    assert abs(current_climb_dev_balance - calculated_dev_balance) < 1000
    assert abs(current_usdt_user1_balance - calculated_usdt_user1_balance) < 1000
    assert abs(current_usdt_balance - calculated_usdt_balance) < 1000

    pass


def test_sell_tokens_busd(setup):
    owner, usdt, busd, climb, user1, user2, *_, dev = setup

    # Allow BUSD
    climb.setStableToken(busd.address, True, sender=owner)
    # Activates token for testing purposes
    climb.ActivateToken(sender=owner)

    tx_amount = 100 * int(1e18)

    # approve USDT by user1
    usdt.approve(climb.address, tx_amount, sender=user1)
    # approve BUSD by user2
    busd.approve(climb.address, tx_amount, sender=user2)

    # buy climb with USDT by user 1
    climb.buy(tx_amount, usdt.address, sender=user1)
    # buy climb with BUSD by user 2
    climb.buy(tx_amount, busd.address, sender=user2)

    assert usdt.balanceOf(climb.address) == tx_amount + int(1e18)
    assert busd.balanceOf(climb.address) == tx_amount

    user1_climb = climb.balanceOf(user1.address)
    user2_climb = climb.balanceOf(user2.address)

    price_before_sell = climb.calculatePrice()
    user1_amount_to_receive = (
        (price_before_sell * (user1_climb // 2) * 95) // 100 // int(1e18)
    )
    # user1 sells half for busd
    climb.sell(user1_climb // 2, busd.address, sender=user1)
    # user2 tries to sell all for busd but should revert
    with reverts("Not enough of STABLE"):
        climb.sellAll(busd.address, sender=user2)
    # user2 sells half for busd
    price_before_sell_2 = climb.calculatePrice()

    user2_amount_to_receive = (
        (price_before_sell_2 * (user2_climb // 2) * 95) // 100 // int(1e18)
    )
    climb.sell(user2_climb // 2, busd.address, sender=user2)

    assert climb.balanceOf(user1.address) == user1_climb // 2
    assert abs(climb.balanceOf(user2.address) - user2_climb // 2) < 1000
    assert usdt.balanceOf(climb.address) == 101 * int(1e18)
    assert busd.balanceOf(climb.address) < 100 * int(1e18)
    assert (
        abs(
            busd.balanceOf(user1.address) - (user1_amount_to_receive + 1000 * int(1e18))
        )
        < 1000
    )
    assert (
        abs(busd.balanceOf(user2.address) - (user2_amount_to_receive + 900 * int(1e18)))
        < 1000
    )

    pass


def test_buy_for(setup):
    owner, usdt, busd, climb, user1, user2, user3, busd_whale, usdt_whale, dev = setup

    buy_amount = 100 * int(1e18)
    # We will assume that user2 is a matrix contract
    climb.setMatrixContract(user2.address, True, sender=owner)

    with reverts("Only matrix allowed"):
        climb.buyFor(user2.address, buy_amount, usdt.address, sender=user1)
    with reverts("No new tokens"):
        climb.buyFor(user2.address, buy_amount, usdt.address, sender=user2)

    usdt.transfer(climb.address, buy_amount, sender=user2)
    climb.buyFor(user2.address, buy_amount, usdt.address, sender=user2)

    assert climb.balanceOf(user2.address) == buy_amount * 95 // 100


def test_owner_functions(setup):
    warnings.warn("Not implemented")
    pass
