from ape import project, Contract, accounts


def main():
    owner = accounts.load("deployment")
    actual_owner = "0x1D225C878f53f6E4846D29c37F4A4F7d69c3CDaC"
    usdt = Contract("0x55d398326f99059fF775485246999027B3197955")
    busd = Contract("0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")

    climb = project.ClimbTokenV2.deploy(
        [usdt.address, busd.address], actual_owner, sender=owner, type=0, publish=True
    )
    matrix = project.BinanceWealthMatrix.deploy(
        climb.address, actual_owner, sender=owner, type=0, publish=True
    )
    # Initial setup
    usdt.transfer(climb.address, int(1e18), sender=owner, type=0)
    climb.setMatrixContract(matrix.address, True, sender=owner, type=0)
    matrix.transferOwnership(actual_owner, sender=owner, type=0)
    climb.transferOwnership(actual_owner, sender=owner, type=0)
    # matrix.initializeMatrix(sender=owner, type=0)
