// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ProjectVoting {
    struct Project {
        string name;
        uint256 votes;
        bool exists;
    }

    struct UserVotes {
        uint256 lastVoteTime;
        uint256 totalVotes;
    }

    address public owner;
    address public mathiasAIAgent;
    uint256 public cooldownPeriod = 6 hours;

    mapping(string => Project) public projects;
    mapping(address => mapping(string => UserVotes)) public userVotes;
    mapping(string => uint256) public projectVotes;

    event ProjectAdded(string projectName);
    event ProjectRemoved(string projectName);
    event Voted(string projectName, address voter, uint256 votes);
    event MathiasAIAgentUpdated(address oldAgent, address newAgent);
    event CooldownPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    error InvalidAddress();
    error ProjectAlreadyExists();
    error ProjectDoesNotExist();
    error CooldownNotExpired();
    error InvalidVoteAmount();
    error UnauthorizedAccess();

    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedAccess();
        _;
    }

    modifier onlyMathiasAIAgent() {
        if (msg.sender != mathiasAIAgent) revert UnauthorizedAccess();
        _;
    }

    modifier onlyOwnerOrMathias() {
        if (msg.sender != owner && msg.sender != mathiasAIAgent) revert UnauthorizedAccess();
        _;
    }

    modifier validProject(string memory _name) {
        if (!projects[_name].exists) revert ProjectDoesNotExist();
        _;
    }

    constructor(address _mathiasAIAgent) {
        if (_mathiasAIAgent == address(0)) revert InvalidAddress();
        owner = msg.sender;
        mathiasAIAgent = _mathiasAIAgent;
    }

    function addProject(string memory _name) external onlyOwnerOrMathias {
        if (projects[_name].exists) revert ProjectAlreadyExists();

        projects[_name] = Project({
            name: _name,
            votes: 0,
            exists: true
        });

        emit ProjectAdded(_name);
    }

    function removeProject(string memory _name) external onlyOwnerOrMathias validProject(_name) {
        delete projects[_name];
        emit ProjectRemoved(_name);
    }

    function vote(string memory _name) external validProject(_name) {
        UserVotes storage userVote = userVotes[msg.sender][_name];
        
        if (block.timestamp - userVote.lastVoteTime < cooldownPeriod) {
            revert CooldownNotExpired();
        }

        userVote.lastVoteTime = block.timestamp;
        userVote.totalVotes += 1;
        projects[_name].votes += 1;
        projectVotes[_name] += 1;

        emit Voted(_name, msg.sender, 1);
    }

    function voteAsAgent(string memory _name, address _voter, uint256 _votes) 
        external 
        onlyMathiasAIAgent 
        validProject(_name) 
    {
        if (_voter == address(0)) revert InvalidAddress();
        if (_votes == 0) revert InvalidVoteAmount();
        
        UserVotes storage userVote = userVotes[_voter][_name];
        
        if (block.timestamp - userVote.lastVoteTime < cooldownPeriod) {
            revert CooldownNotExpired();
        }

        userVote.lastVoteTime = block.timestamp;
        userVote.totalVotes += _votes;
        projects[_name].votes += _votes;
        projectVotes[_name] += _votes;

        emit Voted(_name, _voter, _votes);
    }

    function getNumberOfVotes(string memory _name) external view validProject(_name) returns (uint256) {
        return projects[_name].votes;
    }

    function getUserVotes(string memory _name, address _user) external view validProject(_name) returns (uint256) {
        return userVotes[_user][_name].totalVotes;
    }

    function updateMathiasAIAgent(address _newAgent) external onlyOwner {
        if (_newAgent == address(0)) revert InvalidAddress();
        address oldAgent = mathiasAIAgent;
        mathiasAIAgent = _newAgent;
        emit MathiasAIAgentUpdated(oldAgent, _newAgent);
    }

    function updateCooldownPeriod(uint256 _newCooldown) external onlyOwner {
        uint256 oldPeriod = cooldownPeriod;
        cooldownPeriod = _newCooldown;
        emit CooldownPeriodUpdated(oldPeriod, _newCooldown);
    }

    function getLastVoteTime(string memory _name, address _user) external view validProject(_name) returns (uint256) {
        return userVotes[_user][_name].lastVoteTime;
    }
}