import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const ubeAddress = (await hre.deployments.get('UbeToken')).address;
  const ubeCeloLP = '0x29cB4536Ee663aCe6f7A5Ca1c3b8Ad68Be398cc0';
  console.log({ deployer, ubeAddress, ubeCeloLP });

  await deployments.deploy('NewUbeCeloFarm', {
    contract: 'StakingRewards',
    from: deployer,
    args: [
      deployer, // address _owner,
      deployer, // address _rewardsDistribution,
      ubeAddress, // address _rewardsToken,
      ubeCeloLP, // address _stakingToken,
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_new_ube_celo_farm'; // id required to prevent reexecution
func.tags = ['NewUbeCeloFarm'];
