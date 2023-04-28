from ape import project, accounts


def main():
    owner = accounts.load("dev_test")
    print(f"Owner'{owner.address}'")
    usdt = project.TestToken.deploy("tUSDT", "TUSDT", sender=owner, type=0)
    busd = project.TestToken.deploy("tBUSD", "TBUSD", sender=owner, type=0)

    climb = project.ClimbTokenV2.deploy(
        [usdt.address, busd.address], owner.address, sender=owner, type=0
    )
    matrix = project.BinanceWealthMatrix.deploy(climb.address, sender=owner, type=0)
    # Initial setup
    usdt.transfer(climb.address, int(1e18), sender=owner, type=0)
    climb.setMatrixContract(matrix.address, True, sender=owner, type=0)
    matrix.initializeMatrix(sender=owner, type=0)
