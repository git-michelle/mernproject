import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../layout/Spinner";
import ProfileItem from "./ProfileItem";
import { getProfiles } from "../../actions/profile";
import SearchFeature from "./SearchFeature";

const Profiles = ({ getProfiles, profile: { profiles, loading } }) => {
  useEffect(() => {
    getProfiles();
  }, [getProfiles]);

  const [SearchTerms, setSearchTerms] = useState("");
  // create search function
  const updateSearchTerms = (newSearchTerm) => {
    setSearchTerms(newSearchTerm);
    console.log(newSearchTerm);

    const variables = {
      searchTerm: newSearchTerm,
    };

    getProfiles(variables);
  };

  return (
    <Fragment>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <h1 className="large text-primary">Developers</h1>
          <p className="lead">
            <i className="fab fa-connectdevelop"></i> Browse and connect with
            developers
          </p>

          {/* search function  */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "1rem auto",
            }}
          >
            <SearchFeature refreshFunction={updateSearchTerms} />
          </div>

          <div className="profiles">
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <ProfileItem key={profile._id} profile={profile} />
              ))
            ) : (
              <h4>No profiles found</h4>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profiles.propTypes = {
  getProfiles: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
});

export default connect(mapStateToProps, { getProfiles })(Profiles);
