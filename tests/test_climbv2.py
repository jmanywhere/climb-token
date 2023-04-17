from ape import project, reverts, Contract
from pytest import fixture

router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"


@fixture
def setup(accounts):
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    user3 = accounts[3]

    usdt = Contract("0x55d398326f99059fF775485246999027B3197955")
    busd = Contract("0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")
    climb = project.ClimbTokenV2.deploy([usdt.address], sender=owner)

    busd_whale = accounts["0xf977814e90da44bfa03b6295a0616a897441acec"]
    usdt_whale = accounts["0x8894e0a0c962cb723c1976a4421c95949be2d4e3"]
    # THIS NEEDS TO HAPPEN
    usdt.transfer(climb.address, int(1e18), sender=usdt_whale)

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
