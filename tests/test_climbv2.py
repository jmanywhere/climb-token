from ape import project, reverts
from pytest import fixture


@fixture
def setup(accounts):
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    user3 = accounts[3]

    usdt = project.TestToken.deploy(sender=owner)
    busd = project.TestToken.deploy(sender=owner)
    climb = project.ClimbTokenV2.deploy([usdt.address], sender=owner)
    # THIS NEEDS TO HAPPEN
    usdt.transfer(climb.address, int(1e18), sender=owner)

    yield owner, usdt, busd, climb, user1, user2, user3


def test_set_stable_token(setup, accounts):
    owner, usdt, busd, climb, user1, user2, user3 = setup

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

    climb.exchangeTokens(usdt.address, busd.address, sender=owner)
    climb.setStableToken(usdt.address, False, sender=owner)

    assert climb.currentStables(0) == busd.address
    assert len(climb.allStables()) == 1

    with reverts("Not enough stables"):
        climb.setStableToken(busd.address, False, sender=owner)
