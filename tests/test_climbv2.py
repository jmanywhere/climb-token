from ape import project, reverts, Contract
from pytest import fixture

router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"


@fixture
def setup(accounts):
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    user3 = accounts[3]
    dev = accounts[4]

    usdt = Contract("0x55d398326f99059fF775485246999027B3197955")
    busd = Contract("0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")
    climb = project.ClimbTokenV2.deploy([usdt.address], dev, sender=owner)

    busd_whale = accounts["0xf977814e90da44bfa03b6295a0616a897441acec"]
    usdt_whale = accounts["0x8894e0a0c962cb723c1976a4421c95949be2d4e3"]
    # THIS NEEDS TO HAPPEN
    usdt.transfer(climb.address, int(1e18), sender=usdt_whale)
    usdt.transfer(owner.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user1.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user2.address, 1000 * int(1e18), sender=usdt_whale)
    usdt.transfer(user3.address, 1000 * int(1e18), sender=usdt_whale)

    yield owner, usdt, busd, climb, user1, user2, user3, busd_whale, usdt_whale


def test_exchange_tokens(setup):
    owner, usdt, busd, climb, user1, user2, user3, *_ = setup

    current_supply = climb.totalSupply()
    climb.setStableToken(busd.address, True, sender=owner)

    climb.exchangeTokens(usdt.address, busd.address, router, sender=owner)

    assert usdt.balanceOf(climb.address) == 0
    assert busd.balanceOf(climb.address) >= int(1e18 * 0.95)
    assert climb.totalSupply() == current_supply
    pass


def test_set_stable_token(setup):
    owner, usdt, busd, climb, user1, *_ = setup

    with reverts("Ownable: caller is not the owner"):
        climb.setStableToken(usdt.address, True, sender=user1)

    assert climb.currentStables(0) == usdt.address
    assert len(climb.allStables()) == 1

    climb.setStableToken(busd.address, True, sender=owner)

    assert climb.currentStables(1) == busd.address
    assert len(climb.allStables()) == 2

    with reverts("Already set"):
        climb.setStableToken(busd.address, True, sender=owner)

    with reverts("Balance not zero"):
        climb.setStableToken(usdt.address, False, sender=owner)

    climb.exchangeTokens(usdt.address, busd.address, router, sender=owner)
    climb.setStableToken(usdt.address, False, sender=owner)

    assert climb.currentStables(0) == busd.address
    assert len(climb.allStables()) == 1

    with reverts("Not enough stables"):
        climb.setStableToken(busd.address, False, sender=owner)


def test_buy_tokens_self_usdt(setup):
    owner, usdt, busd, climb, user1, user2, user3, busd_whale, usdt_whale = setup

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
    owner, usdt, busd, climb, user1, user2, user3, busd_whale, usdt_whale = setup

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
    owner, usdt, busd, climb, user1, user2, user3, *_ = setup

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
    owner, usdt, busd, climb, user1, user2, user3, *_ = setup

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
