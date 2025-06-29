import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const commonsToken = '0x7b97031b6297bc8e030B07Bd84Ce92FEa1B00c3e';
  const gloToken = '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3';
  console.log({ deployer, commonsToken });

  await deployments.deploy('CommonsStake', {
    contract: 'StakingRewards30Days',
    from: deployer,
    args: [
      deployer, // address _owner,
      deployer, // address _rewardsDistribution,
      commonsToken, // address _rewardsToken,
      commonsToken, // address _stakingToken,
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  await deployments.deploy('CommonsGloStake', {
    contract: 'StakingRewards30Days',
    from: deployer,
    args: [
      deployer, // address _owner,
      deployer, // address _rewardsDistribution,
      gloToken, // address _rewardsToken,
      commonsToken, // address _stakingToken,
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_commons_stake'; // id required to prevent reexecution
func.tags = ['CommonsStake'];
