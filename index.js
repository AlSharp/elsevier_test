const client = FHIR.client("https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca");

const getPatientInfo = id => {
  return new Promise((resolve, reject) => {
    client.request(`Patient/${id}`)
      .then(info => resolve(info))
      .catch(error => reject(error))
  })
}

const getPatientConditions = id => {
  return new Promise((resolve, reject) => {
    client.request(`Condition?patient=${id}&clinicalstatus=active`)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}

const {Component} = React;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patient: null,
      activeConditions: [],
      error: false
    }
  }

  async componentDidMount() {
    try {
      const patient = await getPatientInfo(1316017);
      this.setState({patient});
      const {entry} = await getPatientConditions(1316017);
      console.log(entry);
      this.setState({activeConditions: entry});
    }
    catch(error) {
      this.setState({error: true});
    }
  }

  showAZ() {
    this.setState({
      activeConditions: this.state.activeConditions.sort((a, b) => {
        if (a.resource.code.text.toLowerCase() > b.resource.code.text.toLowerCase()) {
          return 1;
        } else if (a.resource.code.text.toLowerCase() < b.resource.code.text.toLowerCase()) {
          return -1;
        } else {
          return 0;
        }
      })
    })
  }

  showZA() {
    this.setState({
      activeConditions: this.state.activeConditions.sort((a, b) => {
        if (a.resource.code.text.toLowerCase() > b.resource.code.text.toLowerCase()) {
          return -1;
        } else if (a.resource.code.text.toLowerCase() < b.resource.code.text.toLowerCase()) {
          return 1;
        } else {
          return 0;
        }
      })
    })
  }

  showOlder() {
    this.setState({
      activeConditions: this.state.activeConditions.sort((a, b) => {
        if (a.resource.dateRecorded > b.resource.dateRecorded) {
          return 1;
        } else if (a.resource.dateRecorded < b.resource.dateRecorded) {
          return -1;
        } else {
          return 0;
        }
      })
    })
  }
  
  showNewer() {
    this.setState({
      activeConditions: this.state.activeConditions.sort((a, b) => {
        if (a.resource.dateRecorded > b.resource.dateRecorded) {
          return -1;
        } else if (a.resource.dateRecorded < b.resource.dateRecorded) {
          return 1;
        } else {
          return 0;
        }
      })
    })
  }

  render() {
    const {patient, activeConditions, error} = this.state;
    return (
      <div className="App">
        <div className="patient-card">
          {
            error ?
            <div>Could not load patient data</div> :
            <div>
              <div className="header">
                {
                  patient ?
                  <div>
                    <div>
                      <span>Patient name: </span>
                      <span>{patient.name.find(name => name.use === 'official').text}</span>
                    </div>
                    <div>
                      <span>Gender: </span>
                      <span>{patient.gender}</span>
                    </div>
                    <div>
                      <span>DOB: </span>
                      <span>{patient.birthDate}</span>
                    </div>
                  </div> :
                  <div>Loading...</div>
                }
              </div>
              <div className="body">
                <table>
                  <thead>
                    <tr>
                      <th colSpan="3">Active conditions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span id="condition-name">Name</span>
                        <button
                          id="sort"
                          onClick={this.showAZ.bind(this)}
                        >
                          A to Z
                        </button>
                        <button
                          id="sort"
                          onClick={this.showZA.bind(this)}
                        >
                          Z to A
                        </button>
                      </td>
                      <td>
                        <span id="first-recorded">First recorded</span>
                        <button
                          id="sort"
                          onClick={this.showOlder.bind(this)}
                        >
                          Older
                        </button>
                        <button
                          id="sort"
                          onClick={this.showNewer.bind(this)}
                        >
                          Newer
                        </button>
                      </td>
                      <td>PubMed Link</td>
                    </tr>
                    {
                      activeConditions
                        .map(condition => condition.resource)
                        .map(resource =>
                          <tr key={resource.id}>
                            <td>{resource.code.text}</td>
                            <td>{resource.dateRecorded}</td>
                            <td><a href={`https://www.ncbi.nlm.nih.gov/pubmed/?term=${resource.code.text}`} target="_blank">Link</a></td>
                          </tr>  
                        )
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);


