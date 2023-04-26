from ape import project, accounts


def main():
    owner = accounts.load("dev_test")
    print(f"Owner'{owner.address}'")
    usdt = project.TestToken.deploy("tUSDT", "TUSDT", sender=owner)
    busd = project.TestToken.deploy("tBUSD", "TBUSD", sender=owner)

    climb = project.ClimbTokenV2.deploy(
        [usdt.address, busd.address], owner.address, sender=owner
    )
    matrix = project.BinanceWealthMatrix.deploy(climb.address, sender=owner)
    # Initial setup
    usdt.transfer(climb.address, int(1e18), sender=owner)
    climb.setMatrixContract(matrix.address, True, sender=owner)
    matrix.initializeMatrix(sender=owner)
